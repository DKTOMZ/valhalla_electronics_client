'use client'
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Loading from "@/components/loading";
import ErrorPage from "@/components/error";
import {FormSubmitButton} from "@/components/form_submit_button";
import {FrontendServices} from "@/lib/inversify.config";
import {HttpService} from "@/services/httpService";
import {GenericResponse} from "@/models/genericResponse";

const VerifyEmail = () => {
  
  //Services
  const router = useRouter();
  const http = FrontendServices.get<HttpService>('HttpService');
  
  //State variables
  const [loading, setLoading] = useState(true);
  const [verificationResponse, setVerificationResponse] = useState<GenericResponse>();
  const [token,setToken] = useState("");
  
  //Handle data fetching
  useEffect(() => {
    const fetchVerificationResponse = async () => {
      return await http.get<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/confirm/email/token=${token}`);
    }
    fetchVerificationResponse().then(response => {
      setVerificationResponse(response.data);
      setLoading(false);
    });
  }, [http, token]);

  //Incoming params
  const tokenParam = useSearchParams().get("token");
  if (!tokenParam) {
    return <ErrorPage title="Error: 404" error="Invalid Link." />;
  } else {
    setToken(tokenParam);
  }

  if (loading) {
    return <div>
      <title>Valhalla - Email confirmation</title>
      <Loading />
    </div>
  }

  if (verificationResponse && verificationResponse.success) {
    return <div className="h-screen flex flex-col items-center justify-center">
        <title>Valhalla - Email confirmed</title>
        <h2 className="dark:text-white mb-5">Congratulations! Your email has been verified. Click the button below to proceed to login.</h2>
        <FormSubmitButton text="Login" callback={() => { router.replace('/pages/auth/login'); } } disabled={false} />
    </div>
  }

  if (verificationResponse && verificationResponse.error) {
    return <ErrorPage title={`Error`} error={verificationResponse.error}/>
  }
  
};

export default VerifyEmail;
