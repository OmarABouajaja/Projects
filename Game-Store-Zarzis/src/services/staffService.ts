/**
 * Alternative Staff Creation Service
 * Uses client-side Supabase calls as fallback when backend admin API is unavailable
 */

import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface StaffMemberData {
    email: string;
    full_name: string;
    phone?: string;
    role: 'owner' | 'worker';
}

/**
 * Client-side staff creation fallback
 * Creates invitation record in database for manual account setup
 */
export async function createStaffInvitation(data: StaffMemberData): Promise<boolean> {
    try {
        // Check if email already exists in profiles
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', data.email)
            .single();

        if (existingProfile) {
            throw new Error('Un utilisateur avec cet email existe déjà');
        }

        // Create a pending invitation record
        const { error: inviteError } = await supabase
            .from('staff_invitations')
            .insert({
                email: data.email,
                full_name: data.full_name,
                phone: data.phone,
                role: data.role,
                status: 'pending',
                invited_at: new Date().toISOString()
            });

        if (inviteError) throw inviteError;

        // Send notification email (optional - requires backend)
        try {
            await fetch('http://localhost:8000/api/notifications/staff-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.email,
                    name: data.full_name,
                    role: data.role
                })
            });
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail the whole operation if email fails
        }

        toast({
            title: '✅ Invitation créée',
            description: `Invitation envoyée à ${data.email}. Ils peuvent maintenant créer leur compte.`
        });

        return true;

    } catch (error: any) {
        console.error('Staff invitation error:', error);
        throw error;
    }
}

/**
 * Alternative: Direct Supabase Admin signup
 * Only works if RLS policies allow it
 */
export async function createStaffDirectly(data: StaffMemberData, tempPassword: string): Promise<boolean> {
    try {
        // This requires service_role key or proper RLS policies
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: tempPassword,
            options: {
                data: {
                    full_name: data.full_name,
                    phone: data.phone
                }
            }
        });

        if (signUpError) throw signUpError;

        if (!signUpData.user) {
            throw new Error('User creation failed');
        }

        // Assign role
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
                user_id: signUpData.user.id,
                role: data.role
            });

        if (roleError) throw roleError;

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: signUpData.user.id,
                full_name: data.full_name,
                phone: data.phone,
                email: data.email,
                is_active: true
            });

        if (profileError) {
            console.warn('Profile creation warning:', profileError);
            // Profile might be auto-created by trigger
        }

        return true;

    } catch (error: any) {
        console.error('Direct staff creation error:', error);
        throw error;
    }
}
