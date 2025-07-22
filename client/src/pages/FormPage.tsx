import { useEffect, useRef, useState } from "react";
import FormSection1 from "../components/formSections/FormSection1";
import FormSectionIntro from "../components/formSections/FormSectionIntro";
import FormSection2 from "../components/formSections/FormSection2";
import { useNavigate, useParams } from "react-router-dom";
import userApi from "../apis/userApi";
import { useSnackbar } from "../hooks/SnackbarContext";
import LoadingComp from "../components/loading/LoadingComp";
import SplashScreen from "../components/SplashScreen";
import FormSectionCompulsory from "../components/formSections/formSectionCompulsory";
import FormSection3 from "../components/formSections/FormSection3";
import FormSection4 from "../components/formSections/FormSection4";
import FormSectionNonCompany from "../components/formSections/FormSectionNonCompany";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  forward: {
    initial: {
      opacity: 0,
      y: "100%",
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: "-100%",
    },
  },
  backward: {
    initial: {
      opacity: 0,
      y: "-100%",
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: "100%",
    },
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeIn",
  duration: 0.5,
};

const FormPage = () => {
  const formsContainerRef = useRef<HTMLDivElement>(null);
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);


 

  const [transitionDirection, setTransitionDirection] = useState<
    "forward" | "backward"
  >("forward");

  const { eventId } = useParams();

  const navigate = useNavigate();

  const [isSplashScreenOn, setIsSplashScreenOn] = useState<boolean>(true);

  // User form filling details states
  const [describedAs, setDescribedAs] = useState<string>("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [wantToNetworkWith, setWantToNetworkWith] = useState<string[]>([]);

  // For only students or freelancer i.e. who does not have any company
  const [bestDescribedAs, setBestDescribedAs] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // It is from the compulsory last form page
  const [helps, setHelps] = useState<string[]>([]);

  // for students only
  const [instituteName, setInstituteName] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");

  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUserFetching, setIsUserFetching] = useState<boolean>(false);

  const fetchUser = async () => {
    setIsUserFetching(true);
    try {
      const response = await userApi.get("/user/");

      if (response.status == 200) {
        showSnackbar("Already form is filled", "info");
        navigate(
          `/connect/${
            eventId ? eventId : localStorage.getItem("currentEventId")
          }`
        );
      }
    } catch (e) {}

    setIsUserFetching(false);
  };

  useEffect(() => {
    fetchUser();

    const timeOutInterval = setTimeout(() => {
      setIsSplashScreenOn(false);
    }, 2000);

    return () => {
      clearInterval(timeOutInterval);
    };
  }, []);

  const submitForm = async (isLastFormSkipped: boolean) => {
    if (!eventId) {
      showSnackbar("Invalid form", "error");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await userApi.post("/user/create", {
        data: {
          name,
          email,
          eventId,
          contactNumber: phoneNumber,
          company: companyName,
          position: describedAs,
          instituteName,
          courseName,
          profession: bestDescribedAs,
          industry: selectedIndustries,
          lookingFor: wantToNetworkWith,
          help: isLastFormSkipped ? [] : helps,
        },
      });

      if (response.status == 200) navigate(`/connect/${eventId}`);
    } catch (e) {
      showSnackbar("Error in submitting the form", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const formsContainerElement = formsContainerRef.current;
    const currentForm = formsContainerElement?.children[currentFormIndex];

    if (currentForm) {
      currentForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentFormIndex]);

  const nextForm = async (isLastFormSkipped: boolean = false) => {
    setTransitionDirection("forward");
    setTimeout(() => {
      setCurrentFormIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        // If it's the last index, submit the form
        if (newIndex === 6) {
          submitForm(isLastFormSkipped);
          return prevIndex;
        }
        return newIndex;
      });
    });
  };

  const backForm = () => {
    setTransitionDirection("backward");
    setTimeout(() => {
      setCurrentFormIndex((prevIndex) => Math.max(0, prevIndex - 1));
    });
  };

  // For showing the splash screen for 2 seconds
  if (isSplashScreenOn) {
    return <SplashScreen />;
  } else if (isUserFetching && !isSplashScreenOn) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingComp />
      </div>
    );
  } else {
    return (
      <div
        className="w-full h-full relative overflow-hidden"
        // style={{
        //   minHeight: innerHeight,
        //   height: innerHeight,
        // }}
      >
        <div className="w-full h-full">
          <div
            ref={formsContainerRef}
            className="w-full flex flex-col flex-nowrap overflow-y-hidden"
            style={{
              minHeight: innerHeight,
              height: windowHeight,
            }}
          >
            <AnimatePresence
              mode="popLayout"
              // This makes the transitions more simultaneous
              onExitComplete={() => {}}
            >
              {currentFormIndex === 0 && (
                <motion.div
                  key="intro-section"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants[transitionDirection]}
                  transition={{
                    ...pageTransition,
                    // Overlap the exit and enter animations
                    delayChildren: 0,
                    staggerChildren: 0,
                  }}
                  className="h-full"
                >
                  <FormSectionIntro nextForm={nextForm} />
                </motion.div>
              )}

              {currentFormIndex === 1 && (
                <motion.div
                  key="section-1"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants[transitionDirection]}
                  transition={{
                    ...pageTransition,
                    delayChildren: 0,
                    staggerChildren: 0,
                  }}
                  className="h-full"

                >
                  <FormSection1
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    number={phoneNumber}
                    setNumber={setPhoneNumber}
                    nextForm={nextForm}
                  />
                </motion.div>
              )}

              {currentFormIndex === 2 && (
                <motion.div
                  key="section-2"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants[transitionDirection]}
                  transition={{
                    ...pageTransition,
                    delayChildren: 0,
                    staggerChildren: 0,
                  }}
                  className="h-full"

                >
                  <FormSection2
                    setDescribedAs={setDescribedAs}
                    describedAs={describedAs}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    instituteName={instituteName}
                    setInsituteName={setInstituteName}
                    courseName={courseName}
                    setCourseName={setCourseName}
                    nextForm={nextForm}
                    backForm={backForm}
                  />
                </motion.div>
              )}

              {currentFormIndex === 3 && (
                <motion.div
                  key="section-3"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants[transitionDirection]}
                  transition={{
                    ...pageTransition,
                    delayChildren: 0,
                    staggerChildren: 0,
                  }}
                  className="h-full"

                >
                  {describedAs == "Freelancer" || describedAs == "Employee" ? (
                    <FormSectionNonCompany
                      nextForm={nextForm}
                      backForm={backForm}
                      bestDescribedAs={bestDescribedAs}
                      setBestDescribedAs={setBestDescribedAs}
                      />
                    ) : (
                      <FormSection3
                      nextForm={nextForm}
                      backForm={backForm}
                      setSelectedIndustries={setSelectedIndustries}
                      bestDescribedAs={describedAs}
                      selectedIndustries={selectedIndustries}
                    />
                  )}
                </motion.div>
              )}

              {currentFormIndex === 4 && (
                <motion.div
                  key="section-4"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants[transitionDirection]}
                  transition={{
                    ...pageTransition,
                    delayChildren: 0,
                    staggerChildren: 0,
                  }}
                  className="h-full"

                >
                  <FormSection4
                    nextForm={nextForm}
                    backForm={backForm}
                    wantToNetworkWith={wantToNetworkWith}
                    setWantToNetworkWith={setWantToNetworkWith}
                  />
                </motion.div>
              )}

              {currentFormIndex === 5 && (
                <motion.div
                  key="compulsory-section"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants[transitionDirection]}
                  transition={{
                    ...pageTransition,
                    delayChildren: 0,
                    staggerChildren: 0,
                  }}
                  className="h-full"

                >
                  <FormSectionCompulsory
                    helps={helps}
                    setHelps={setHelps}
                    backForm={backForm}
                    nextForm={nextForm}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
};

export default FormPage;
