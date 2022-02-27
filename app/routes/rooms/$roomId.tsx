import { useEffect, useMemo, useState } from "react";
import { LoaderFunction, useLoaderData } from "remix";
import { EstimateButton } from "~/components/EstimateButton";
import { PlayerEstimate } from "~/components/PlayerEstimate";
import { getUserId } from "~/utls/user";

export const loader: LoaderFunction = async ({ params }) => {
  return {
    roomId: params.roomId,
  };
};

interface Player {
  id: string;
  roomId: string;
  estimate: number | null;
}

interface Message {
  userId: string;
  roomId: string;
  isHidden: boolean;
  estimate: number | null;
  reset?: boolean;
  playerLeft?: boolean;
}

const ESTIMATE_OPTIONS = [1, 2, 3, 5, 8];

export default function Room() {
  const { roomId } = useLoaderData();
  const [estimate, setEstimate] = useState<number | null>(null);
  const [isHidden, setIsHidden] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [socket, setSocket] = useState<WebSocket>();

  const atLeastOneEstimate = useMemo(
    () => !!estimate || players.some((player) => !!player.estimate),
    [estimate, players]
  );

  useEffect(() => {
    instantiateWebSocket();
  }, []);

  useEffect(() => {
    processNewMessage();
  }, [latestMessage]);

  const instantiateWebSocket = () => {
    const userId = getUserId();
    const socket = new WebSocket(location.origin.replace(/^http/, "ws"));

    socket.onopen = () => {
      const message = JSON.stringify({
        userId,
        roomId,
        estimate: null,
        isHidden: true,
      });
      socket.send(message);
    };

    socket.onerror = (error) => {
      console.error("Websocket error", error);
    };

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);

      setLatestMessage(data);
    };

    window.addEventListener("beforeunload", () => {
      const message = JSON.stringify({
        userId,
        roomId,
        playerLeft: true,
      });
      socket.send(message);
    });

    setSocket(socket);
  };

  const processNewMessage = () => {
    const userId = getUserId();

    if (
      !latestMessage ||
      roomId !== latestMessage.roomId ||
      latestMessage.userId === userId
    ) {
      return;
    }

    if (latestMessage.isHidden === false) {
      setIsHidden(false);
    }
    if (!!latestMessage.reset) {
      resetState();
    }

    const existingPlayer = players.find(
      (player) => player.id === latestMessage.userId
    );

    if (!existingPlayer) {
      addPlayer({
        id: latestMessage.userId,
        roomId: latestMessage.roomId,
        estimate: latestMessage.estimate,
      });

      return;
    }

    if (latestMessage.playerLeft) {
      removePlayer(latestMessage.userId);
    }

    if (!!latestMessage.estimate) {
      updatePlayerEstimate(existingPlayer, latestMessage.estimate);
    }
  };

  const addPlayer = (player: Player) => {
    setPlayers((players) => [...players, player]);

    // let the new player know that you're here
    const userId = getUserId();
    const message = JSON.stringify({ userId, roomId, estimate, isHidden });
    socket?.send(message);
  };

  const removePlayer = (playerId: string) => {
    console.log(`Player ${playerId} left`);

    setPlayers((players) => {
      return [...players].filter((player) => player.id !== playerId);
    });
  };

  const updatePlayerEstimate = (player: Player, newEstimate: number) => {
    console.log(`Player ${player.id} voted ${newEstimate}`);

    setPlayers((players) => {
      const index = players.indexOf(player);
      const newPlayers = [...players];
      newPlayers[index].estimate = newEstimate;

      return newPlayers;
    });
  };

  const handleEstimateClick = (estimate: number) => {
    setEstimate(estimate);

    const userId = getUserId();
    const message = JSON.stringify({ userId, roomId, estimate, isHidden });
    socket?.send(message);
  };

  const handleRevealClick = () => {
    setIsHidden(false);

    const userId = getUserId();
    const message = JSON.stringify({
      userId,
      roomId,
      estimate,
      isHidden: false,
    });
    socket?.send(message);
  };

  const handleResetClick = () => {
    resetState();

    const userId = getUserId();
    const message = JSON.stringify({
      userId,
      roomId,
      estimate: null,
      isHidden: true,
      reset: true,
    });
    socket?.send(message);
  };

  const resetState = () => {
    setEstimate(null);
    setIsHidden(true);
    setPlayers((players) => {
      return [...players].map((player) => ({ ...player, estimate: null }));
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "300px",
          marginBottom: "2rem",
        }}
      >
        {ESTIMATE_OPTIONS.map((estimate, i) => (
          <EstimateButton
            key={i}
            disabled={!isHidden}
            estimate={estimate}
            onClick={handleEstimateClick}
          />
        ))}
      </div>

      <p style={{ marginBottom: "1rem" }}>
        {estimate
          ? `Your current estimate is ${estimate}`
          : "You haven't estimated yet"}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <PlayerEstimate
          {...{ estimate, isHidden }}
          style={{
            color: "white",
            backgroundColor: `rgb(8, 126, 168, ${estimate ? 1 : 0.2})`,
          }}
        />

        {players.map((player) => (
          <PlayerEstimate
            key={player.id}
            estimate={player.estimate}
            {...{ isHidden }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          marginBottom: "2rem",
        }}
      >
        <button
          style={{ height: "40px", width: "75px", cursor: "pointer" }}
          onClick={handleResetClick}
        >
          Reset
        </button>
        <button
          disabled={!isHidden || !atLeastOneEstimate}
          style={{
            height: "40px",
            width: "75px",
            cursor: isHidden && atLeastOneEstimate ? "pointer" : "not-allowed",
            marginLeft: "1rem",
          }}
          onClick={handleRevealClick}
        >
          Reveal
        </button>
      </div>
    </div>
  );
}
