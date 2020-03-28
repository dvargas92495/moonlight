import React from "react";
import styled from "styled-components";
import {
  PRIMARY_COLOR,
  PRIMARY_BACKGROUND_COLOR,
  QUARTER_OPAQUE,
  CONTENT_COLOR,
  SECONDARY_COLOR,
} from "../styles/colors";
import PublicPage from "./PublicPage";
import PrivatePage from "./PrivatePage";
import { useUserId } from "../hooks/router";

const MainHeader = styled.h1`
  color: ${PRIMARY_COLOR};
  display: flex;
  justify-content: center;
  width: 100%;
`;

const SecondHeader = styled.h1`
  font-size: 4rem;
  color: ${CONTENT_COLOR};
  text-align: center;
`;

const Content = styled.h2`
  font-size: 3rem;
  color: ${PRIMARY_COLOR};
  text-align: center;
`;

const ContentText = styled.h3`
  color: ${CONTENT_COLOR};
  text-align: center;
  margin: 0 100px;
`;

const ContentBlurb = styled.section`
  border: 1px solid ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  flex-direction: row;
  justify-content: space-between;
  background: ${PRIMARY_BACKGROUND_COLOR};
  padding-bottom: 18px;
`;

const SectionHeader = styled.h3`
  color: ${SECONDARY_COLOR};
  text-align: center;
`;

const Background1 = styled.section`
  background: ${PRIMARY_BACKGROUND_COLOR};
  padding: 1em;
  border-bottom: 1px solid ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  justify-content: space-between;
`;

const HomePageContent = () => (
  <div>
    <MainHeader>MOONLIGHT HEALTH</MainHeader>

    <Background1>
      <SectionHeader>
        COMPETITIVE ADVANTAGE FOR GP & ORTHODONTIC OFFICES
      </SectionHeader>
      <SecondHeader>Put an Oral Surgeon In Your Practice</SecondHeader>
    </Background1>

    <div>
      <Content>Stop sending money out your door…</Content>
      <ContentText>
        Have you ever stopped to think how much revenue you are sending out the
        door in oral surgery referrals? If your practice refers out even 5
        patients a month, and that patient receives an average of $3,000 worth
        of treatment, that is over $180,000 annually that the referring practice
        doesn't see a dime of. What if the surgeon worked for you? What if you
        received a portion of the revenue generated by your valuable referrals,
        without having to worry about the liability, risk, and equipment
        involved in hiring a surgical associate?
      </ContentText>
    </div>

    <Content>Contact Info</Content>
    <ContentText>Location: DC/MD/VA/FL</ContentText>
    <ContentText>Email: dr.patel@moonlightoralsurgery.com</ContentText>
    <ContentText>Phone: (408) 506-8919</ContentText>

    <Content>Advantages</Content>
    <ContentBlurb>
      <SectionHeader>More Convinient</SectionHeader>
      <ContentText>
        Our services improve the general dentist’s practice by bringing oral
        surgery services directly to their patients. The ability to offer
        specialized services in-house is an added layer of convenience that will
        only add to your patient’s comfort and trust in your practice.
      </ContentText>
    </ContentBlurb>

    <ContentBlurb>
      <SectionHeader>Passive Revenue</SectionHeader>
      <ContentText>
        Stop referring patients to another provider when you could own the
        revenue stream. With our unique partnership structure, the practice
        earns a passive income, in form of a percentage of production, from the
        cases our surgeon completes at their office.
      </ContentText>
    </ContentBlurb>

    <ContentBlurb>
      <SectionHeader>Stress-Free</SectionHeader>
      <ContentText>
        Practice owners do not have to concern themselves with the high costs,
        stress, and responsibility of liability associated with surgical
        procedures. Moonlight Oral Surgery ensures all of our surgeons are fully
        licensed, certified, and equipped with everything you need.
      </ContentText>
    </ContentBlurb>

    <ContentBlurb>
      <SectionHeader>More Freedom</SectionHeader>
      <ContentText>
        Practice owners can book our surgeons on-demand, knowing that they will
        come to your office with everything they need to perform their
        procedures. Our surgeon can be equipped with their own surgical
        instruments and supplies along with the necessary instrument loadout for
        any procedures. Unlike hiring an associate, there is no long-term
        commitment. Practice owners can choose their preferred oral surgeon when
        they want.
      </ContentText>
    </ContentBlurb>
  </div>
);

const HomePage = () => {
  const userId = useUserId();
  return userId === 0 ? (
    <PublicPage>
      <HomePageContent />
    </PublicPage>
  ) : (
    <PrivatePage>
      <HomePageContent />
    </PrivatePage>
  );
};

export default HomePage;
