import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { SOCKET_EVENTS } from "@cloudpulse/shared";

export class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [env.CLIENT_URL, "http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
      if (!token) {
        // Allow unauthenticated connection in public/demo room if needed, but attach standard room if valid
        return next();
      }
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
        (socket as any).user = decoded;
        next();
      } catch (err) {
        return next();
      }
    });

    this.io.on("connection", (socket: Socket) => {
      const user = (socket as any).user;
      if (user?.id) {
        socket.join(`user:${user.id}`);
      }

      socket.on(SOCKET_EVENTS.SUBSCRIBE_SERVER, (serverId: string) => {
        socket.join(`server:${serverId}`);
      });

      socket.on(SOCKET_EVENTS.UNSUBSCRIBE_SERVER, (serverId: string) => {
        socket.leave(`server:${serverId}`);
      });

      socket.on("disconnect", () => {
        // Disconnected
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error("Socket.IO not initialized!");
    }
    return this.io;
  }

  public broadcastToServer(serverId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`server:${serverId}`).emit(event, data);
    this.io.emit(event, data); // Global broadcast for overview dashboard as well
  }

  public emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public broadcastGlobal(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}

export const socketManager = SocketManager.getInstance();
