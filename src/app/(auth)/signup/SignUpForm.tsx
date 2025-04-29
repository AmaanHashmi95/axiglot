"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/(main)/components/ui/form";
import { Input } from "@/app/(main)/components/ui/input";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";
import { Button } from "@/app/(main)/components/ui/button";
import { PasswordInput } from "@/app/(auth)/PasswordInput";
import LoadingButton from "@/app/(main)/components/LoadingButton";
import { Checkbox } from "@/app/(main)/components/ui/checkbox"; // Add this import
import Link from "next/link"; // Already imported in page.tsx, but safe to add here if missing.

export default function SignUpForm() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      terms: undefined as unknown as true, // <-- fixes TypeScript literal 'true' issue
    },
  });

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signUp(values);
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <Form {...form}>
      {success ? (
        <p className="text-center text-green-600">
          Please check your inbox to verify your email.
        </p>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error && <p className="text-center text-destructive">{error}</p>}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms and Conditions */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm">
                  I agree to the{" "}
                  <Link
                    href="/policies.html"
                    target="_blank"
                    className="underline"
                  >
                    Terms and Conditions
                  </Link>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton
            loading={isPending}
            type="submit"
            disabled={!form.watch("terms")}
            className="w-full"
          >
            Create account
          </LoadingButton>
        </form>
      )}
    </Form>
  );
}
