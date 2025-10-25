import { useEffect, useRef, RefObject } from "react";
import { io, Socket } from "socket.io-client";
import type { RollDifficultyResponse } from "@/lib/api";
import {
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

const DEFAULT_SOCKET_PATH = "/socket.io/";

const resolveSocketConnectionConfig = (
  socketUrl: string,
): { url: string | undefined; path: string } => {
  if (!socketUrl) {
    return { url: undefined, path: DEFAULT_SOCKET_PATH };
  }

  try {
    // Se for uma URL completa (ex: http://localhost:3001/socket.io/)
    const url = new URL(socketUrl);
    return { url: url.origin, path: url.pathname };
  } catch {
    // Se for apenas um path (ex: /socket.io/)
    return { url: undefined, path: socketUrl };
  }
};

const SOCKET_EVENTS: Record<keyof Omit<SocketHandlers, "onConnect">, string> = {
  onDiceRolled: "dice:rolled",
  onDiceCleared: "dice:cleared",
  onCharacterLinked: "campaign:characterLinked",
  onCharacterUnlinked: "campaign:characterUnlinked",
  onStatusUpdated: "status:updated",
};

export const useCampaignSocket = ({
  campaignId,
  socketUrl,
  handlers,
}: UseCampaignSocketParams) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const { url, path } = resolveSocketConnectionConfig(socketUrl);

    const socket = url
      ? io(url, {
          path,
          transports: ["websocket"],
        })
      : io({
          path,
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

    socket.on("connect", handleConnect);
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Registra os handlers para os eventos do socket
    const diceRolledListener = (payload: RollDifficultyResponse) => {
      handlers.current?.onDiceRolled?.(payload);
    };
    const diceClearedListener = (payload: { campaignId: string }) => {
      handlers.current?.onDiceCleared?.(payload);
    };
    const characterLinkedListener = (
      payload: CampaignCharacterEventPayload,
    ) => {
      handlers.current?.onCharacterLinked?.(payload);
    };
    const characterUnlinkedListener = (
      payload: CampaignCharacterEventPayload,
    ) => {
      handlers.current?.onCharacterUnlinked?.(payload);
    };
    const statusUpdatedListener = (payload: StatusUpdatedPayload) => {
      handlers.current?.onStatusUpdated?.(payload);
    };

    socket.on(SOCKET_EVENTS.onDiceRolled, diceRolledListener);
    socket.on(SOCKET_EVENTS.onDiceCleared, diceClearedListener);
    socket.on(SOCKET_EVENTS.onCharacterLinked, characterLinkedListener);
    socket.on(SOCKET_EVENTS.onCharacterUnlinked, characterUnlinkedListener);
    socket.on(SOCKET_EVENTS.onStatusUpdated, statusUpdatedListener);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error");
      socket.off(SOCKET_EVENTS.onDiceRolled, diceRolledListener);
      socket.off(SOCKET_EVENTS.onDiceCleared, diceClearedListener);
      socket.off(SOCKET_EVENTS.onCharacterLinked, characterLinkedListener);
      socket.off(SOCKET_EVENTS.onCharacterUnlinked, characterUnlinkedListener);
      socket.off(SOCKET_EVENTS.onStatusUpdated, statusUpdatedListener);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [campaignId, socketUrl, handlers]); // `handlers` (a ref) é estável.

  return socketRef;
};

export type { SocketHandlers };
