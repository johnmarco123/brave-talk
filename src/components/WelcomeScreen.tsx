import { DispatchWithoutAction } from "react";
import { useSubscribedStatus } from "../hooks/subscription";
import { useBrowserProperties } from "../hooks/browser-properties";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JoinCallSection } from "./JoinCallSection";
import { SubscriptionCTA } from "./SubscriptionCTA";

interface Props {
  onStartCall: DispatchWithoutAction;
  notice?: string;
}

export const WelcomeScreen: React.FC<Props> = ({ onStartCall, notice }) => {
  const browserProps = useBrowserProperties();
  const subscribed = useSubscribedStatus();

  return (
    <Background>
      <Header subscribed={subscribed} />
      <div css={{ flexGrow: 1 }}>
        <JoinCallSection
          subscribed={subscribed}
          browser={browserProps}
          onStartCall={onStartCall}
          notice={notice}
        />

        {/* TODO */}
        <div className="section recordings" id="recordings"></div>

        <SubscriptionCTA subscribed={subscribed} />
      </div>
      <Footer />
    </Background>
  );
};
