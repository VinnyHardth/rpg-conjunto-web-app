import { useEffect, useRef, RefObject } from "react";
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
  handlers: RefObject<SocketHandlers>;
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
      handlers.current?.onConnect?.(socket);
    };

    socket.emit("joinRoom", room);
    socket.on("connect", handleConnect);
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Envolvemos os handlers em uma função para garantir que sempre
    // acessemos a versão mais recente de `handlers.current`.
    const registeredHandlers = SOCKET_EVENTS.map(({ key, event }) => {
      const handler = (...args: unknown[]) => {
        const specificHandler = handlers.current?.[key];
        if (specificHandler) {
          // Forçamos a tipagem para uma função genérica para satisfazer o TypeScript.
          (specificHandler as (...args: unknown[]) => void)(...args);
        }
      };
      if (handlers.current?.[key]) {
        socket.on(event, handler);
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error");
      SOCKET_EVENTS.forEach(({ event }) => {
        // Para remover os listeners, precisamos remover todos para um dado evento,
        // já que a referência da função `handler` muda a cada renderização.
        socket.off(event);
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [campaignId, socketUrl, handlers]); // `handlers` (a ref) é estável.

  return socketRef;
};

export type { SocketHandlers };
