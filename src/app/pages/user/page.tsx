'use client'
import Layout from "@/components/Layout";
import { Collapse } from "@/components/collapse";
import { FormSubmitButton } from "@/components/form_submit_button";
import Loading from "@/components/loading";
import { FrontendServices } from "@/lib/inversify.config";
import { HttpService } from "@/services/httpService";
import { ValidationService } from "@/services/validationService";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { signOut } from 'next-auth/react';
import { HttpServiceResponse } from "@/models/httpServiceResponse";
import { GenericResponse } from "@/models/genericResponse";
import Modal from "@/components/modal";
import { profilePictureResponse } from "@/models/profilePictureResponse";
import { useSharedState } from "@/app/contexts/context";
import { UtilService } from "@/services/utilService";

const User: React.FC = () => { 
    
    const http = FrontendServices.get<HttpService>('HttpService');
    const validationService = FrontendServices.get<ValidationService>('ValidationService');
    const utilService = FrontendServices.get<UtilService>('UtilService');
    
    //State variables
    const [newPassword,setNewPassword] = useState('');
    const [currentPassword,setCurrentPassword] = useState('');
    const [newConfirmPassword,setNewConfirmPassword] = useState('');
    const [newPasswordVisible,setNewPasswordVisible] = useState(false);
    const [currentPasswordVisible,setCurrentPasswordVisible] = useState(false);
    const [newConfirmPasswordVisible,setNewConfirmPasswordVisible] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingSubmitName] = useState(false);
    const [changePasswordSuccess,setChangePasswordSuccess] = useState(false);
    const [uploading,setUploading] = useState(false);
    const [name,setName] = useState('');
    const { updateCurrency, currencies, currency } = useSharedState();

    //Element refs
    const currentPasswordElement = useRef<HTMLInputElement>(null);
    const newPasswordElement = useRef<HTMLInputElement>(null);
    const newConfirmPasswordElement = useRef<HTMLInputElement>(null);
    const currentPasswordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const newPasswordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const newConfirmPasswordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const changePasswordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const imageField = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
    const saveImageError = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
    const updateNameError = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;

    const {data: session, status, update} = useSession();

    useEffect(()=>{
        if(session && session.user && session.user.name){
            setName(session.user?.name);
        }
    },[session])
    
    
    const uploadImage = async(file: File | null | undefined) => {
        saveImageError.current.innerHTML = '';

        if(!file){ return; }

        const validation = await validationService.validateImage(file);

        if (typeof validation === 'string') {
            utilService.handleErrorInputField(saveImageError,validation);
        } else {
            setUploading(true);

            const postData = new FormData();    
            const userEmail = session?.user && session.user.email ? session.user.email : '';
            postData.append('email',userEmail);
            postData.append('profile_pic',file);

            const response = await http.post<profilePictureResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/auth/private/profile/picture/upload`,
                postData
            );

            if (response.data.success) {
                const updateUser = {
                    expires: session?.expires,
                    user: {
                      email: session?.user?.email,
                      image: response.data.image,
                      name: session?.user?.name
                    },
                };
                await update(updateUser);
            } else {
                utilService.handleErrorInputField(saveImageError,response.data.error ?? response.statusText);
            }
            setUploading(false);
        }

    };

    const handlePasswordReset = async() => {
        if(!validationService.validatePassword(currentPassword,currentPasswordError) || 
        !validationService.comparePasswords(newPassword,newConfirmPassword,newConfirmPasswordError,newConfirmPasswordError)) {
            return
        }

        setLoadingSubmit(true);

        const response: HttpServiceResponse<GenericResponse> = await http.post(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/auth/private/changepassword`, JSON.stringify(
            {
                newPassword:newConfirmPassword,
                currentPassword: currentPassword
            }))
        
        if (response.data.success) {
            setChangePasswordSuccess(response.data.success);
        } else {
            utilService.handleErrorInputField(changePasswordError,response.data.error ?? response.statusText);
        }

        setLoadingSubmit(false);
    
    };

    const handleUpdateName = async()=>{
        if(!name){
            return;
        }
        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/auth/private/profile/name/edit`,
            JSON.stringify(
                {
                    email: session?.user?.email,
                    name: name
                }
            )
        );

        if(response.status >= 200 && response.status < 300 && response.data.success){
            const updateUser = {
                expires: session?.expires,
                user: {
                  email: session?.user?.email,
                  image: session?.user?.image,
                  name: name
                },
            };
            await update(updateUser);
        } else {
            utilService.handleErrorInputField(updateNameError,response.data.error ?? response.statusText);
        }
    };

    return (
        <>
        {status === 'loading' ? <Loading /> :
        status === 'authenticated' ?
        <Layout>
            { changePasswordSuccess ? <Modal title={'Success!'} body={'Password changed successfully'} 
                callback={()=>{
                    setChangePasswordSuccess(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setNewConfirmPassword('');
                    setNewPasswordVisible(false);
                    setNewConfirmPasswordVisible(false);
                    setCurrentPasswordVisible(false);
                    window.scrollTo(0,0);
                }} />
                : null}
            <title>Valhalla - User</title>
            <div className="mb-4">
                <div className="h-1 w-24 bg-orange-500"></div>
                <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-user text-orange-500"></i></span> USER PROFILE</h2>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className='space-y-6 max-sm:w-full sm:max-w-sm w-3/4'>
                    {/* eslint-disable-next-line no-prototype-builtins */}
                        {!session?.user?.hasOwnProperty('thirdparty')
                        ?
                        uploading
                        ?
                            <div style={{borderRadius:'50%'}} className="dark:bg-gray-200 bg-neutral-400 h-40 w-40 flex flex-row items-center justify-center border-orange-400 border-2 m-auto cursor-pointer hover:brightness-75">
                                <Loading height="h-8" width="w-8" />
                            </div>
                        :
                            <div onClick={()=>saveImageError.current.innerHTML=''}>
                                <label style={{borderRadius: '50%'}} className="h-40 w-40 flex flex-row items-center justify-center border-orange-400 border-2 m-auto cursor-pointer hover:brightness-75" >
                                    <input ref={imageField} style={{borderRadius: 'inherit'}} multiple={false} accept="image/png, image/jpeg, .jpeg, .png" type="file" className="hidden h-full w-full" onChange={(e)=>{
                                        uploadImage(e.target.files?.item(0));
                                    }}/>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="object-fill h-full w-full" style={{borderRadius: 'inherit'}} src={`${session?.user?.image || '/no_profile_pic.jpg'}`}  alt={''}/>
                                </label>
                            </div>    
                        :
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className="border-orange-400 border-2 m-auto object-fill" style={{borderRadius: '50%'}} src={`${session?.user?.image || '/no_profile_pic.jpg'}`} height={150} width={150} alt={''}/>
                        }
                        <div ref={saveImageError} className='text-red-500 text-center'></div>
                        <div className='flex flex-col'>
                            <label htmlFor='user-email' className='sm:text-base text-sm dark:text-white'>Email</label>
                            <input onBlur={()=>{
                            }} value={session && session.user && session.user.email ? session.user.email: ' '} required autoComplete='email' readOnly className='px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2' type='email' name='user-email'/>
                        </div>
                        <Collapse title="Update Name">
                            <form onSubmit={(e)=>e.preventDefault()}>
                                <div className='flex flex-col mb-3'>
                                    <label htmlFor='user-name' className='sm:text-base text-sm dark:text-white'>Name</label>
                                    <input onBlur={()=>{ updateNameError.current.innerHTML = ''
                                    }} value={name} onChange={(e)=>setName(e.target.value)} required className='px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2' type='text' name='user-name'/>
                                </div>
                                <div ref={updateNameError} className='text-red-500 text-center mb-3'></div>
                                <FormSubmitButton text='Update Name' disabled={loadingSubmitName} callback={async()=>handleUpdateName()}/>
                            </form>
                        </Collapse>
                        {currencies.length > 0 ? 
                        <Collapse title="Update Currency" className="md:hidden">
                                <select defaultValue={currency?.shortName || currencies.filter((item)=>item.shortName=='KES')[0].shortName}
                                onChange={(e)=>updateCurrency(currencies.filter((item)=>item.shortName==e.target.value)[0])} title="Currencies" className="dark:bg-zinc-700 bg-slate-200 text-black dark:text-white p-2 rounded-md w-full">
                                {currencies.map((currency,index)=>{
                                    return <option key={currency.symbol??index} value={currency.shortName}>{currency.shortName}</option>
                                })}
                                </select>
                        </Collapse>
                        : null
                        }
                    {/* eslint-disable-next-line no-prototype-builtins */}
                        {session && !session.user?.hasOwnProperty('thirdparty')
                        ?
                        <Collapse title="Change Password">
                            <form onSubmit={(e)=>e.preventDefault()}>
                            <div className='flex flex-col'>
                                <label htmlFor='current-password' className='sm:text-base text-sm dark:text-white'>Current Password</label>
                                <div className='relative'>
                                    <input required ref={currentPasswordElement} onBlur={()=>{
                                            currentPasswordError.current.innerHTML = '';
                                            validationService.validatePassword(currentPassword,currentPasswordError)
                                        }
                                        } value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} placeholder='******' autoComplete='current-password' className='px-2 outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={currentPasswordVisible ? 'text' : 'password'} name='current-password'/>
                                    { currentPasswordVisible ? 
                                        <i onClick={()=>setCurrentPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                                        : <i onClick={()=>setCurrentPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                                    }
                                </div>
                                <div ref={currentPasswordError} className='text-red-500 text-center'></div>
                            </div>
                            <br/>
                            <div className='flex flex-col'>
                                <label htmlFor='new-password' className='sm:text-base text-sm dark:text-white'>New Password</label>
                                <div className='relative'>
                                    <input required ref={newPasswordElement} onBlur={()=>{
                                            changePasswordError.current.innerHTML = '';
                                            if (validationService.validatePassword(newPassword,newPasswordError)){
                                                validationService.comparePasswords(newPassword,newConfirmPassword,newPasswordError,newConfirmPasswordError);
                                            }
                                        }
                                        } value={newPassword} autoComplete="new-password" onChange={(e)=>setNewPassword(e.target.value)} placeholder='******' className='px-2 outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={newPasswordVisible ? 'text' : 'password'} name='new-password'/>
                                    { newPasswordVisible ? 
                                        <i onClick={()=>setNewPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                                        : <i onClick={()=>setNewPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                                    }
                                </div>
                                <div ref={newPasswordError} className='text-red-500 text-center'></div>
                            </div>
                            <br />
                            <div className='flex flex-col'>
                                <label htmlFor='new-confirm-password' className='sm:text-base text-sm dark:text-white'>Confirm New Password</label>
                                <div className='relative'>
                                    <input required ref={newConfirmPasswordElement} onBlur={()=>{
                                        changePasswordError.current.innerHTML = '';
                                        if(validationService.validatePassword(newConfirmPassword,newConfirmPasswordError)) {
                                            validationService.comparePasswords(newPassword,newConfirmPassword,newPasswordError,newConfirmPasswordError);
                                        }
                                    }} value={newConfirmPassword} autoComplete="new-confirm-password" onChange={(e)=>setNewConfirmPassword(e.target.value)} placeholder='******' className='px-2 outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={newConfirmPasswordVisible ? 'text' : 'password'} name='new-confirm-password'/>
                                    { newConfirmPasswordVisible ? 
                                    <i onClick={()=>setNewConfirmPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                                    : <i onClick={()=>setNewConfirmPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                                    }
                                </div>
                                <div ref={newConfirmPasswordError} className='text-red-500'></div>
                            </div>
                            <br />
                            <div ref={changePasswordError} className='text-red-500 text-center mb-2'></div>    
                            <FormSubmitButton text='Reset Password' disabled={loadingSubmit} callback={async()=>handlePasswordReset()}/>
                            </form>
                        </ Collapse>
                        : null}
                        <button type="button" onClick={async()=>await signOut({callbackUrl:'/',redirect:true})} className="text-white w-full p-2 mt-4 bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500">
                        <i className="fa-solid fa-right-from-bracket fa-lg text-white"></i> Logout
                        </button>
                </div>
            </div>
        </Layout>
        : redirect('/pages/auth/login')
        }
        </>
    );
}

export default User;