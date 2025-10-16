import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { RollDifficultyResponse } from "@/lib/api";
import type {
  CampaignCharacterEventPayload,
  StatusUpdatedPayload,
} from "../socketTypes";

type SocketHandlers = {
  onDiceRolled?: (payload: RollDifficultyResponse) => void;
  onDiceCleared?: (payload: { campaignId: string }) => void;
  onCharacterLinked?: (payload: CampaignCharacterEventPayload) => void;
  onCharacterUnlinked?: (payload: CampaignCharacterEventPayload) => void;
  onStatusUpdated?: (payload: StatusUpdatedPayload) => void;
  onConnect?: (socket: Socket) => void;
};

interface UseCampaignSocketParams {
  campaignId: string | null;
  socketUrl: string;
  handlers: SocketHandlers;
}

const SOCKET_EVENTS: Array<{
  key: keyof SocketHandlers;
  event: string;
}> = [
  { key: "onDiceRolled", event: "dice:rolled" },
  { key: "onDiceCleared", event: "dice:cleared" },
  { key: "onCharacterLinked", event: "campaign:characterLinked" },
  { key: "onCharacterUnlinked", event: "campaign:characterUnlinked" },
  { key: "onStatusUpdated", event: "status:updated" },
];

export const useCampaignSocket = ({
  campaignId,
  socketUrl,
  handlers,
}: UseCampaignSocketParams) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const socket = io("/", {
      path: "/socket.io/",
      transports: ["websocket"],
    });

    socketRef.current = socket;
    const room = `campaign-${campaignId}`;

    const handleConnect = () => {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`Socket connected: ${socket.id}`);
      }
      socket.emit("joinRoom", room);
      handlers.onConnect?.(socket);
    };

    socket.emit("joinRoom", room);
    socket.on("connect", handleConnect);
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    SOCKET_EVENTS.forEach(({ key, event }) => {
      const handler = handlers[key];
      if (handler) {
        socket.on(event, handler);
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error");
      SOCKET_EVENTS.forEach(({ key, event }) => {
        const handler = handlers[key];
        if (handler) {
          socket.off(event, handler);
        }
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [campaignId, handlers, socketUrl]);

  return socketRef;
};

export type { SocketHandlers };
