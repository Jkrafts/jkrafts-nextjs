'use client';

import { useForm, SubmitHandler } from "react-hook-form";
import Icon from "./Icon";

interface IFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm = () => {

  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = data => {
    console.log(data);
  };


  return (
    <div className="grid lg:grid-cols-2 items-start gap-12 p-8 mx-auto max-w-4xl max-lg:max-w-2xl bg-base [box-shadow:0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-md">
      <div>
        <h2 className="text-text text-3xl font-bold">Let&apos;s Talk</h2>
        <p className="text-[15px] text-slate-600 mt-4 leading-relaxed">Have some big idea or brand to develop and need help? Then reach out we&apos;d love to hear about your project and provide help.</p>
        <div className="mt-12">
          <h2 className="text-text text-base font-semibold">Email</h2>
          <ul className="mt-4">
            <li className="flex items-center">
              <div className="bg-pf-icon-surface h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                <Icon name="email" alt="Mail Icon" size={28} />
              </div>
              <a href="#" className="text-sm ml-4 cursor-target">
                <small className="block text-text">Mail</small>
                <span className="text-blue-600 font-medium">info@jkrafts.com</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-text text-base font-semibold">Socials</h2>
          <ul className="flex mt-4 space-x-4">
            <li className="cursor-target bg-pf-icon-surface h-10 w-10 rounded-full flex items-center justify-center shrink-0">
              <a href="#">
                <Icon name="facebook" alt="FaceBook Icon" size={28} />
              </a>
            </li>
            <li className="cursor-target bg-pf-icon-surface h-10 w-10 rounded-full flex items-center justify-center shrink-0">
              <a href="#">
                <Icon name="linkedin" alt="LinkedIn Icon" size={28} />
              </a>
            </li>
            <li className="cursor-target bg-pf-icon-surface h-10 w-10 rounded-full flex items-center justify-center shrink-0">
              <a href="#">
                <Icon name="x" alt="X(Formerly Twitter) Icon" size={28} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <form id="contact" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input type='text' placeholder='Name' {...register("name", { required: true })}
          className="w-full text-text rounded-md py-2.5 px-4 border border-gray-300 text-sm outline-0 focus:border-blue-500" />

          {errors.name?.type === "required" && (<p role="alert" className="text-red-500 text-xs">First name is required</p>)}

        <input type='email' placeholder='Email' {...register("email", { required: true })}
          className="w-full text-text rounded-md py-2.5 px-4 border border-gray-300 text-sm outline-0 focus:border-blue-500" />

          {errors.email?.type === "required" && (<p role="alert" className="text-red-500 text-xs">Email is required</p>)}

        <input type='text' placeholder='Subject' {...register("subject", { required: true })}
          className="w-full text-text rounded-md py-2.5 px-4 border border-gray-300 text-sm outline-0 focus:border-blue-500" />

          {errors.subject?.type === "required" && (<p role="alert" className="text-red-500 text-xs">Subject is required</p>)}

        <textarea placeholder='Message' rows={6} {...register("message", { required: true })}
          className="w-full text-text rounded-md px-4 border border-gray-300 text-sm pt-2.5 outline-0 focus:border-blue-500"></textarea>

          {errors.message?.type === "required" && (<p role="alert" className="text-red-500 text-xs">Message is required</p>)}

        <button type='submit'
          className="text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium px-4 py-2.5 w-full cursor-pointer border-0 mt-2 cursor-target">Send message</button>
      </form>
    </div>
  )
}

export default ContactForm;