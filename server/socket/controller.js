const { verify } = require("../../shared/middleware/security-middleware");
const { routeMatcher} = helpers;

async function authenticate(token) {
  if (!token) {
    logger.info("No token");
    return null;
  }
  token = token.replace("Bearer ", "");
  let user = await verify(token);
  if (!user) {
    logger.info("Invalid token " + token);
    return null;
  }
  return user;
}

const fakeRequest = async (item, route, user) => {
  const fakeRequest = {
    body: item,
    user: user,
    params: route.variables,
    __: (msg) => msg,
  };
  const fakeResponse = {
    statusCode: 200,
    jsonPayload: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (payload) {
      this.jsonPayload = payload;
      return this;
    },
  };
  const middlewares = route.obj.middlewares;

  const next = async (index) => {
    if (index >= middlewares.length) {
      await route.obj.handler(fakeRequest, fakeResponse);
      return fakeResponse;
    }
    const middleware = middlewares[index];
    return await middleware(fakeRequest, fakeResponse, async () => {
      return next(index + 1);
    });
  };
  const resp = await next(0);
  return fakeResponse;
};

const socketController = async (socket) => {
  let user = await authenticate(socket.handshake.headers.authorization);
  if (!user) {
    socket.disconnect();
    return;
  }
  const cTime = Math.floor(Date.now() / 1000);
  setTimeout(() => {
    logger.info(`Disconnecting client ${user.username} on ${socket.id}`);
    socket.disconnect(true);
  }, (user.exp - cTime) * 1000); // Disconnect when token expires

  user = user.user;
  logger.info(`Received a connection from ${user.username} on ${socket.id}`);

  socket.on("exec", async (pload, callback) => {
    if (pload && pload.path && pload.op) {
      let route = routeMatcher.matchPath(pload.op + "/" + pload.path);
      //let roles = await roleService.findAll();
      const result = await fakeRequest(pload.item, route, user);
      if (result.statusCode != 200) {
        callback({ status: "error", error: result.jsonPayload });
        return;
      }
      if (callback) {
        callback({ status: "ok", result: result.jsonPayload });
      }
    } else {
      if (callback) {
        callback({ status: "error", error: ["Invalid payload"] });
      }
    }
  });
  socket.on("disconnect", () => {
    logger.info(`User ${user.username} disconnected from ${socket.id}`);
  });
};

module.exports = { socketController };
