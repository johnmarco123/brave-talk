import { useEffect, useState } from "react";
import { web3NFTs } from "./api";
import { rememberAvatarUrl, NFT } from "./core";
import { JitsiContext } from "../../jitsi/types";
import { Login } from "./Login";
import { OptionalSettings } from "./OptionalSettings";
import { bodyText, header } from "./styles";
import { useWeb3CallState } from "../../hooks/use-web3-call-state";
import { Background } from "../Background";
import { Button } from "../Button";

interface Props {
  roomName: string;
  setJwt: (jwt: string) => void;
  jitsiContext: JitsiContext;
  setJitsiContext: (context: JitsiContext) => void;
}

export const JoinCall: React.FC<Props> = ({
  roomName,
  setJwt,
  jitsiContext,
  setJitsiContext,
}) => {
  const [nfts, setNfts] = useState<NFT[] | undefined>();
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const {
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
    joinCall,
  } = useWeb3CallState(setFeedbackMessage);

  // this magic says "run this function when the web3address changes"
  useEffect(() => {
    if (web3Address) {
      setNfts(undefined);

      web3NFTs(web3Address)
        .then(setNfts)
        .catch((err) => {
          console.error("!!! failed to fetch NTFs ", err);
          setFeedbackMessage("Failed to fetch avatar NFTs");
        });
    }
  }, [web3Address]);

  const onJoinCallClicked = async () => {
    if (!web3Address) return;

    try {
      rememberAvatarUrl(nft);
      setFeedbackMessage("Joining...");
      const result = await joinCall(roomName);
      if (result) {
        const [jwt, web3Authentication] = result;
        const web3Participants = { "": web3Address };
        setJwt(jwt as string);
        setJitsiContext({
          ...jitsiContext,
          web3Participants,
          web3Authentication,
        });
      }
    } catch (e: any) {
      console.error("!!! failed to join the call", e);
      setFeedbackMessage(e.message);
    }
  };

  return (
    <Background>
      <div
        css={{
          display: "flex",
          justifyContent: "center",
          marginTop: "62px",
          flexDirection: "column",
        }}
      >
        <div css={[header, { marginBottom: "22px" }]}>Join a Web3 Call</div>

        <Login web3address={web3Address} onAddressSelected={setWeb3Address} />

        {web3Address && (
          <div css={{ marginTop: "28px" }}>
            <OptionalSettings
              startCall={false}
              permissionType={permissionType}
              setPermissionType={setPermissionType}
              nfts={nfts}
              nft={nft}
              setNft={setNft}
              participantPoaps={participantPoaps}
              setParticipantPoaps={setParticipantPoaps}
              moderatorPoaps={moderatorPoaps}
              setModeratorPoaps={setModeratorPoaps}
              participantNFTCollections={participantNFTCollections}
              setParticipantNFTCollections={setParticipantNFTCollections}
              moderatorNFTCollections={moderatorNFTCollections}
              setModeratorNFTCollections={setModeratorNFTCollections}
            />

            <div css={[bodyText, { marginTop: "28px" }]}>{feedbackMessage}</div>

            <Button onClick={onJoinCallClicked} css={{ marginTop: "45px" }}>
              <div>Join Web3 call</div>
            </Button>
          </div>
        )}
      </div>
    </Background>
  );
};
