import { useState } from "react";
import { Web3Authentication, web3Prove } from "../components/web3/api";
import { POAP, NFTcollection } from "../components/web3/core";
import { generateRoomName } from "../lib";
import { fetchJWT } from "../rooms";

interface Web3CallState {
  web3Address?: string;
  permissionType: string;
  nft: string | null;
  participantPoaps: POAP[];
  moderatorPoaps: POAP[];
  participantNFTCollections: NFTcollection[];
  moderatorNFTCollections: NFTcollection[];
  setWeb3Address: (web3Address: string) => void;
  setPermissionType: (permissionType: string) => void;
  setNft: (nft: string) => void;
  setParticipantPoaps: (participanPoaps: POAP[]) => void;
  setModeratorPoaps: (moderatorPoaps: POAP[]) => void;
  setParticipantNFTCollections: (
    participantNFTCollections: NFTcollection[]
  ) => void;
  setModeratorNFTCollections: (
    moderatorNFTCollections: NFTcollection[]
  ) => void;
  startCall: () => Promise<[string, string, Web3Authentication] | undefined>;
  joinCall: (
    roomName: string
  ) => Promise<[string, Web3Authentication] | undefined>;
}

export function useWeb3CallState(
  setFeedbackMessage: (message: string) => void
): Web3CallState {
  const [web3Address, setWeb3Address] = useState<string>();
  const [permissionType, setPermissionType] = useState<string>("POAP");
  const [nft, setNft] = useState<string | null>(null);
  const [participantPoaps, setParticipantPoaps] = useState<POAP[]>([]);
  const [moderatorPoaps, setModeratorPoaps] = useState<POAP[]>([]);
  const [participantNFTCollections, setParticipantNFTCollections] = useState<
    NFTcollection[]
  >([]);
  const [moderatorNFTCollections, setModeratorNFTCollections] = useState<
    NFTcollection[]
  >([]);

  window.ethereum?.on("accountsChanged", (accounts: string[]) => {
    console.log("!!! accountsChanged", accounts);
    setWeb3Address(accounts[0]);
  });

  const joinCall = async (
    roomName: string
  ): Promise<[string, Web3Authentication] | undefined> => {
    try {
      const auth = await web3Prove(web3Address as string);
      const web3 = {
        web3Authentication: auth,
        avatarURL: nft,
      };

      const { jwt } = await fetchJWT(roomName, false, setFeedbackMessage, web3);
      window.history.pushState({}, "", "/" + roomName);
      return [jwt, auth];
    } catch (e: any) {
      console.error(e);
      if (e.message.includes("user rejected action")) {
        setFeedbackMessage("Sign request cancelled");
      } else {
        setFeedbackMessage(e.message);
      }
    }
  };

  const startCall = async (): Promise<
    [string, string, Web3Authentication] | undefined
  > => {
    try {
      const auth = await web3Prove(web3Address as string);
      const roomName = generateRoomName();
      const web3 = {
        web3Authentication: auth,
        web3Authorization: {
          method: permissionType,
          POAPs: {
            participantADs: {
              allow: participantPoaps.map((p) => p.event.id.toString()),
              deny: [],
            },
            moderatorADs: {
              allow: moderatorPoaps.map((p) => p.event.id.toString()),
              deny: [],
            },
          },
          Collections: {
            participantADs: {
              allow: participantNFTCollections.map((c) => c.id),
              deny: [],
            },
            moderatorADs: {
              allow: moderatorNFTCollections.map((c) => c.id),
              deny: [],
            },
          },
        },
        avatarURL: nft,
      };

      const { jwt } = await fetchJWT(roomName, true, setFeedbackMessage, web3);
      window.history.pushState({}, "", "/" + roomName);
      return [roomName, jwt, auth];
    } catch (e: any) {
      console.error(e);
      if (e.message.includes("user rejected action")) {
        setFeedbackMessage("Sign request cancelled");
      } else {
        setFeedbackMessage(e.message);
      }
    }
  };

  return {
    web3Address,
    permissionType,
    nft,
    participantPoaps,
    moderatorPoaps,
    participantNFTCollections,
    moderatorNFTCollections,
    setWeb3Address,
    setPermissionType,
    setNft,
    setParticipantPoaps,
    setModeratorPoaps,
    setParticipantNFTCollections,
    setModeratorNFTCollections,
    startCall,
    joinCall,
  };
}
