db.createUser({
  user: "ENV.MONGO_USER",
  pwd: "ENV.MONGO_PASSWORD",
  roles: [
    {
      role: "readWrite",
      db: "devconnect",
    },
  ],
});

db.createCollection("users");
db.createCollection("projects");
db.createCollection("tasks");
