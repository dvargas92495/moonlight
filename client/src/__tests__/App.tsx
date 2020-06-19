import React from "react";
import { render } from "@testing-library/react";
import App from "../App";

test("renders App header", () => {
  const { container } = render(<App />);
  expect(container).toMatchInlineSnapshot(`
    .c1 {
      background-color: transparent;
      display: inline-block;
      padding: 10px;
      text-align: center;
    }

    .c4 {
      background-color: transparent;
      display: inline-block;
      padding: 10px;
      text-align: center;
      border-left: 1px solid #C5C6C740;
    }

    .c2 {
      color: #C5C6C7;
      -webkit-text-decoration: none;
      text-decoration: none;
      font-weight: 500;
    }

    .c2:hover {
      color: #66FCF1;
    }

    .c0 {
      font-size: calc(10px + 2vmin);
      background: #0B0C10;
      border-bottom: 1px solid #C5C6C740;
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-flex-direction: row;
      -ms-flex-direction: row;
      flex-direction: row;
      -webkit-box-pack: justify;
      -webkit-justify-content: space-between;
      -ms-flex-pack: justify;
      justify-content: space-between;
      -webkit-flex: 0 1 auto;
      -ms-flex: 0 1 auto;
      flex: 0 1 auto;
    }

    .c3 {
      display: -webkit-inline-box;
      display: -webkit-inline-flex;
      display: -ms-inline-flexbox;
      display: inline-flex;
      -webkit-flex-direction: row;
      -ms-flex-direction: row;
      flex-direction: row;
      -webkit-box-pack: end;
      -webkit-justify-content: flex-end;
      -ms-flex-pack: end;
      justify-content: flex-end;
    }

    .c5 {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-flex: 1 1 auto;
      -ms-flex: 1 1 auto;
      flex: 1 1 auto;
      overflow-y: hidden;
    }

    .c6 {
      opacity: 1;
      -webkit-transition: opacity 0.78s;
      transition: opacity 0.78s;
    }

    .c7 {
      color: #66FCF1;
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-pack: center;
      -webkit-justify-content: center;
      -ms-flex-pack: center;
      justify-content: center;
      width: 100%;
    }

    .c10 {
      font-size: 4rem;
      color: #C5C6C7;
      text-align: center;
    }

    .c11 {
      font-size: 3rem;
      color: #66FCF1;
      text-align: center;
    }

    .c12 {
      color: #C5C6C7;
      text-align: center;
      margin: 0 100px;
    }

    .c13 {
      border: 1px solid #C5C6C740;
      -webkit-flex-direction: row;
      -ms-flex-direction: row;
      flex-direction: row;
      -webkit-box-pack: justify;
      -webkit-justify-content: space-between;
      -ms-flex-pack: justify;
      justify-content: space-between;
      background: #0B0C10;
      padding-bottom: 18px;
    }

    .c9 {
      color: #45A29E;
      text-align: center;
    }

    .c8 {
      background: #0B0C10;
      padding: 1em;
      border-bottom: 1px solid #C5C6C740;
      -webkit-box-pack: justify;
      -webkit-justify-content: space-between;
      -ms-flex-pack: justify;
      justify-content: space-between;
    }

    <div>
      <div>
        <header
          class="c0"
        >
          <div
            class="c1"
          >
            <a
              class="c2"
              href="/"
            >
              HOME
            </a>
          </div>
          <div
            class="c3"
          >
            <div
              class="c4"
            >
              <a
                class="c2"
                href="/about"
              >
                ABOUT
              </a>
            </div>
            <div
              class="c4"
            >
              <a
                class="c2"
                href="/apply/dentist"
              >
                DENTISTS
              </a>
            </div>
            <div
              class="c4"
            >
              <a
                class="c2"
                href="/apply/specialist"
              >
                SPECIALISTS
              </a>
            </div>
            <div
              class="c4"
            >
              <a
                class="c2"
                href="/login"
              >
                LOG IN
              </a>
            </div>
          </div>
        </header>
        <div
          class="c5"
        >
          <div
            class="c6"
          >
            <div>
              <h1
                class="c7"
              >
                EMDEO
              </h1>
              <section
                class="c8"
              >
                <h3
                  class="c9"
                >
                  COMPETITIVE ADVANTAGE FOR GP & ORTHODONTIC OFFICES
                </h3>
                <h1
                  class="c10"
                >
                  Put an Oral Surgeon In Your Practice
                </h1>
              </section>
              <div>
                <h2
                  class="c11"
                >
                  Stop sending money out your door…
                </h2>
                <h3
                  class="c12"
                >
                  Have you ever stopped to think how much revenue you are sending out the door in oral surgery referrals? If your practice refers out even 5 patients a month, and that patient receives an average of $3,000 worth of treatment, that is over $180,000 annually that the referring practice doesn't see a dime of. What if the surgeon worked for you? What if you received a portion of the revenue generated by your valuable referrals, without having to worry about the liability, risk, and equipment involved in hiring a surgical associate?
                </h3>
              </div>
              <h2
                class="c11"
              >
                Contact Info
              </h2>
              <h3
                class="c12"
              >
                Location: DC/MD/VA/FL
              </h3>
              <h3
                class="c12"
              >
                Email: dr.patel@moonlightoralsurgery.com
              </h3>
              <h3
                class="c12"
              >
                Phone: (408) 506-8919
              </h3>
              <h2
                class="c11"
              >
                Advantages
              </h2>
              <section
                class="c13"
              >
                <h3
                  class="c9"
                >
                  More Convenient
                </h3>
                <h3
                  class="c12"
                >
                  Our services improve the general dentist’s practice by bringing oral surgery services directly to their patients. The ability to offer specialized services in-house is an added layer of convenience that will only add to your patient’s comfort and trust in your practice.
                </h3>
              </section>
              <section
                class="c13"
              >
                <h3
                  class="c9"
                >
                  Passive Revenue
                </h3>
                <h3
                  class="c12"
                >
                  Stop referring patients to another provider when you could own the revenue stream. With our unique partnership structure, the practice earns a passive income, in form of a percentage of production, from the cases our surgeon completes at their office.
                </h3>
              </section>
              <section
                class="c13"
              >
                <h3
                  class="c9"
                >
                  Stress-Free
                </h3>
                <h3
                  class="c12"
                >
                  Practice owners do not have to concern themselves with the high costs, stress, and responsibility of liability associated with surgical procedures. Emdeo ensures all of our surgeons are fully licensed, certified, and equipped with everything you need.
                </h3>
              </section>
              <section
                class="c13"
              >
                <h3
                  class="c9"
                >
                  More Freedom
                </h3>
                <h3
                  class="c12"
                >
                  Practice owners can book our surgeons on-demand, knowing that they will come to your office with everything they need to perform their procedures. Our surgeon can be equipped with their own surgical instruments and supplies along with the necessary instrument loadout for any procedures. Unlike hiring an associate, there is no long-term commitment. Practice owners can choose their preferred oral surgeon when they want.
                </h3>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
});
