// src/app/(main)/settings/EditProfileForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserProfileSchema, UpdateUserProfileValues } from "@/lib/validation";
import { useUpdateProfileMutation } from "@/app/(main)/users/[username]/mutations";
import { UserData } from "@/lib/types";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/LoadingButton";
import UserAvatar from "@/components/UserAvatar";

interface Props {
  user: Pick<UserData, "id" | "displayName" | "bio" | "avatarUrl" | "username">;
}

export default function EditProfileForm({ user }: Props) {
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
    },
  });

  const mutation = useUpdateProfileMutation();

  function onSubmit(values: UpdateUserProfileValues) {
    mutation.mutate({ values });
  }

  return (
    <div className="space-y-5">
      <UserAvatar avatarUrl={user.avatarUrl} size={96} className="rounded-full" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton type="submit" loading={mutation.isPending}>
            Save
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
