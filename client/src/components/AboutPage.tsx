import React from "react";
import WebPage from "./WebPage";
import styled from "styled-components";
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  CONTENT_COLOR,
} from "../styles/colors";
import founderImg from "../images/ryanPatelFounder.jpeg";

const Header = styled.h1`
  color: ${PRIMARY_COLOR};
`;

const Subheader = styled.h3`
  color: ${SECONDARY_COLOR};
`;

const Content = styled.p`
  color: ${CONTENT_COLOR};
`;

const Figure = styled.figure`
  margin: 0 16px 16px 0;
  float: left;
`;

const HeaderContainer = styled.div`
  margin-top: 10vh;
  margin-bottom: 15vh;
  text-align: center;
`;

const HeaderContent = styled(Content)`
  font-size: 5.625vw;
  margin: 0px;
`;

const ContentRow = styled.div`
  margin: 64px;
  display: flex;
  justify-content: space-between;
`;

const ColumnContent = styled.div`
  max-width: 45%;
  min-width: 45%;
`;

const FounderHeader = styled(Header)`
  margin-top: 0px;
`;

const FounderColumn = styled.div`
  max-width: 30%;
  min-width: 30%;
`;

const AboutPage = () => (
  <WebPage>
    <HeaderContainer>
      <Header>About</Header>
      <HeaderContent>Earn More.</HeaderContent>
    </HeaderContainer>
    <div>
      <ContentRow>
        <ColumnContent>
          <Header>Stress Less.</Header>
          <Content>
            Moonlight Oral Surgery is the premier concierge oral surgery service
            in the DMV area. By bringing the complete Comprehensive Oral Surgery
            Experience directly to your office, your patients get the benefit of
            specialized, quality care from the comfort and convenience of your
            chair. Your offices makes more money. Everybody wins. Our Oral
            Surgeon(s) can be hired on a weekly, biweekly, or monthly basis to
            tend to all of your office’s surgical needs including: Surgical
            Extractions, Implant Placement, Sinus Lifts, Dentoalveolar
            Procedures, Facial Cosmetics, All-on-4, Bone Grafting, and Tissue
            Engineering. Additionally, our surgeons maintain hospital privileges
            for any complex cases your office may see.
          </Content>
        </ColumnContent>
        <ColumnContent>
          <Header>No Extra Effort.</Header>
          <Content>
            We at Moonlight Oral Surgery know that it can be a hassle to expand
            your practice to include Oral Surgery by traditional methods. The
            draining process of interviewing and finding an associate right for
            your practice, the expensive investment of purchasing all the
            necessary equipment, and the stress of taking on added risk can
            liability can be draining. Book a Moonlight Oral Surgeon today to
            discover how easy and convenient a dentist-surgeon partnership can
            be...
          </Content>
        </ColumnContent>
      </ContentRow>
      <ContentRow>
        <Header>Founders</Header>
      </ContentRow>
      <ContentRow>
        <div>
          <Figure>
            <img src={founderImg} alt={"Dr. Ryan Patel, DDS"} />
          </Figure>
          <FounderHeader>CEO</FounderHeader>
          <Subheader>Dr. Ryan Patel, DDS</Subheader>
          <Content>
            Ryan grew up in San Jose, California, and later moved to Raleigh,
            North Carolina, where he graduated from the University of North
            Carolina - Chapel Hill with a B.S. in Biology, and minors in
            Chemistry and Spanish. His interest gradually turned from medicine
            to a more specific scope - oral surgery - after shadowing numerous
            different surgical specialists.
          </Content>
          <Content>
            Inspired by the challenge and exposure the city would offer, he
            chose to attend dental school at Columbia University's College of
            Dental Medicine - the premier Ivy-League institution in New York
            City. As fortune would have it, he met his wife on his first day on
            campus. While at Columbia, he and the Class of 2015 enacted several
            changes in student body legislation and local community healthcare
            initiatives that would impact the institution for years to come. As
            Dr. Patel honed his surgical skills through additional rotations in
            the oral & maxillofacial surgery department at Columbia, he realized
            he truly wanted to impact the field.
          </Content>
          <Content>
            Dr. Patel was selected to one of the most rigorous and prestigious
            oral maxillofacial surgery residency in the country - Washington
            Hospital Center. In addition to operating at Washington Hospital
            Center (DC's largest hospital and level-1 trauma center), he also
            saw patients at the National Institutes of Health (NIH), Children’s
            National Medical Center, Washington DC Veterans Affairs Medical
            Center, Greater Baltimore Medical Center, and the world-famous Johns
            Hopkins Hospital. He served as Chief Resident during his last year
            of residency.
          </Content>
          <Content>
            Throughout his career, Dr. Patel has been an outspoken advocate for
            maximum patient comfort and surgical innovation, as well as
            operational excellence in surgical practice. He has lectured on the
            national circuit in cutting-edge research for TMJ afflictions, as
            well as digital workflow in implant dentistry. He is proficient in
            implant, third molar, and orthognathic surgery, using the latest
            techniques and surgical skills. Dr. Patel believes his role as a
            surgical specialist is to facilitate excellence in services, whether
            between the patient or practice owner.
          </Content>
          <Content>
            Ryan enjoys water polo, boxing, golfing, eating, bartending, working
            on his '82 Benz, and exploring DC with his wife in his spare time.
          </Content>
          <ContentRow>
            <FounderColumn>
              <Subheader>Education</Subheader>
              <Content>
                <strong>MedStar Washington Hospital Center</strong>,
                <strong>Department of Oral & Maxillofacial Surgery</strong>,
                Washington DC
              </Content>
              <Content>
                Chief Resident, Department of Oral & Maxillofacial Surgery
                2018-2019
              </Content>
              <Content>Residency, 2015-2019</Content>
              <Content>
                <strong>Columbia University</strong>Doctor of Dental Surgery,
                2015
              </Content>
            </FounderColumn>
            <FounderColumn>
              <Subheader>Activities & Affiliations</Subheader>
              <ul>
                <li>
                  <Content>AAOMS</Content>
                </li>
                <li>
                  <Content>ABOMS-Eligible</Content>
                </li>
                <li>
                  <Content>ADA</Content>
                </li>
                <li>
                  <Content>AIID</Content>
                </li>
              </ul>
            </FounderColumn>
            <FounderColumn>
              <Subheader>Licensure</Subheader>
              <Content>• DC, Virginia, Maryland</Content>
            </FounderColumn>
          </ContentRow>
        </div>
      </ContentRow>
      <ContentRow>
        <div>
          <Header>Associates</Header>
          <Subheader>More to come...</Subheader>
          <Content>
            To inquire regarding joining our team, contact us at
            info@moonlightoralsurgery.com
          </Content>
        </div>
      </ContentRow>
    </div>
  </WebPage>
);

export default AboutPage;
