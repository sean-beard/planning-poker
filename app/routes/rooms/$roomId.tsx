import { useEffect, useMemo, useRef, useState } from "react";
import { Link, LoaderFunction, useLoaderData } from "remix";
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
  isSpectator: boolean;
  estimate: number | null;
}

interface Message {
  userId: string;
  roomId: string;
  isHidden: boolean;
  estimate: number | null;
  isSpectator: boolean;
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
  const [isSpectator, setIsSpectator] = useState(false);
  const isSpectatorRef = useRef(false);
  let pingSocketInterval: number | undefined;

  const atLeastOneEstimate = useMemo(
    () => !!estimate || players.some((player) => !!player.estimate),
    [estimate, players]
  );

  useEffect(() => {
    instantiateWebSocket();

    return () => {
      window.removeEventListener("onhashchange", handleHashChange);
      window.clearInterval(pingSocketInterval);
    };
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
        isSpectator: false,
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
        isSpectator,
      });
      socket.send(message);
    });

    window.addEventListener("onhashchange", handleHashChange);

    pingSocketInterval = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            userId,
            roomId,
            estimate,
            isHidden,
            isSpectator: isSpectatorRef.current,
          })
        );
      }
    }, 30000);

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
      return;
    }

    const existingPlayer = players.find(
      (player) => player.id === latestMessage.userId
    );

    if (!existingPlayer) {
      addPlayer({
        id: latestMessage.userId,
        roomId: latestMessage.roomId,
        estimate: latestMessage.estimate,
        isSpectator: latestMessage.isSpectator,
      });

      return;
    }

    if (existingPlayer) {
      if (latestMessage.playerLeft) {
        removePlayer(latestMessage.userId);
        return;
      }

      updatePlayerSpectatorStatus(existingPlayer, latestMessage.isSpectator);

      if (!!latestMessage.estimate) {
        updatePlayerEstimate(existingPlayer, latestMessage.estimate);
      }
    }
  };

  const addPlayer = (player: Player) => {
    console.log(`Player ${player.id} joined`);

    setPlayers((players) => [...players, player]);

    // let the new player know that you're here
    const userId = getUserId();
    const message = JSON.stringify({
      userId,
      roomId,
      estimate,
      isHidden,
      isSpectator,
    });
    socket?.send(message);
  };

  const removePlayer = (playerId: string) => {
    console.log(`Player ${playerId} left`);

    setPlayers((players) => {
      return [...players].filter((player) => player.id !== playerId);
    });
  };

  const updatePlayerSpectatorStatus = (
    player: Player,
    isSpectator: boolean
  ) => {
    setPlayers((players) => {
      const index = players.indexOf(player);
      const newPlayers = [...players];
      newPlayers[index].isSpectator = isSpectator;

      return newPlayers;
    });
  };

  const updatePlayerEstimate = (player: Player, newEstimate: number) => {
    setPlayers((players) => {
      const index = players.indexOf(player);
      const newPlayers = [...players];
      newPlayers[index].estimate = newEstimate;

      return newPlayers;
    });
  };

  const handleHashChange = () => {
    const message = JSON.stringify({
      userId: getUserId(),
      roomId,
      playerLeft: true,
      isSpectator,
    });
    socket?.send(message);
  };

  const handleEstimateClick = (estimate: number) => {
    setEstimate(estimate);

    const userId = getUserId();
    const message = JSON.stringify({
      userId,
      roomId,
      estimate,
      isHidden,
      isSpectator,
    });
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
      isSpectator,
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
      isSpectator,
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

  const handleSpectatorToggle = () => {
    const newValue = !isSpectatorRef.current;
    isSpectatorRef.current = newValue;
    setIsSpectator(newValue);

    const userId = getUserId();
    const message = JSON.stringify({
      userId,
      roomId,
      estimate,
      isHidden,
      isSpectator: newValue,
    });
    socket?.send(message);
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 2rem 0" }}>
        <Link
          to="/"
          onClick={() => {
            const message = JSON.stringify({
              userId: getUserId(),
              roomId,
              playerLeft: true,
              isSpectator,
            });
            socket?.send(message);
          }}
          style={{ textDecoration: "none", color: "rgb(8, 126, 168)" }}
        >
          EP Planning Poker
        </Link>
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "300px",
          marginBottom: "2rem",
        }}
      >
        {ESTIMATE_OPTIONS.map((estimate) => (
          <EstimateButton
            key={estimate}
            disabled={!isHidden || isSpectator}
            estimate={estimate}
            onClick={handleEstimateClick}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {!isSpectator && (
          <PlayerEstimate
            {...{ estimate, isHidden }}
            style={{
              color: "white",
              backgroundColor: `rgb(8, 126, 168, ${estimate ? 1 : 0.2})`,
            }}
          />
        )}

        {players.map((player) => {
          if (player.isSpectator) {
            return null;
          }

          return (
            <PlayerEstimate
              key={player.id}
              estimate={player.estimate}
              {...{ isHidden }}
            />
          );
        })}
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

      <input
        id="is-spectator-checkbox"
        type="checkbox"
        checked={!isSpectator}
        style={{ cursor: "pointer" }}
        onChange={handleSpectatorToggle}
      />
      <label
        htmlFor="is-spectator-checkbox"
        style={{ cursor: "pointer", marginLeft: "0.5rem" }}
      >
        {isSpectator ? "You are not a voter" : "You are a voter"}
      </label>

      {!isSpectator && (
        <p style={{ marginBottom: "1rem" }}>
          {estimate
            ? `Your current estimate is ${estimate}`
            : "You haven't estimated yet"}
        </p>
      )}
    </div>
  );
}
