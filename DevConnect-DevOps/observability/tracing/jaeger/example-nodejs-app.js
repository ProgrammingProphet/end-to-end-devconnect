/**
 * Example of instrumenting a Node.js Express application 
 * with OpenTelemetry to send traces to Jaeger.
 * 
 * Dependencies required:
 * npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node \
 *             @opentelemetry/exporter-trace-otlp-http express
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// 1. Initialize OpenTelemetry SDK and point it to Jaeger's OTLP receiver
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // In K8s, point this to the Jaeger service in the monitoring namespace
    // Default Jaeger OTLP/HTTP port is 4318
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger-collector.monitoring.svc.cluster.local:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  // Set the service name so it shows up beautifully in the Jaeger UI
  serviceName: 'devconnect-api-service',
});

// Start the SDK
sdk.start();

// 2. Standard Express Application
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/api/users', async (req, res) => {
  // The 'auto-instrumentations-node' automatically traces this HTTP request,
  // creating a span. Any database calls made here (e.g., via pg, mongoose) 
  // will be traced as child spans!
  
  // Simulated DB call
  await new Promise(resolve => setTimeout(resolve, 150));
  
  res.json({ message: "List of users", users: ["Alice", "Bob"] });
});

app.listen(PORT, () => {
  console.log(`DevConnect API Service listening at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
