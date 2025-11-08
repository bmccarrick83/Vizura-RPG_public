
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dices, LogIn } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/components/auth/google-icon';
import Link from 'next/link';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSuccessfulSignIn = async (user: User) => {
    // Force a refresh of the ID token to get the latest claims.
    // This is useful if claims were recently changed, but in our new flow,
    // we don't need to wait for a server-side process. We just need a fresh token.
    await user.getIdToken(true);
    
    toast({
      title: 'Sign in successful!',
      description: "Welcome back. You're now logged in.",
    });
    router.push('/home');
  };


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        setError("Firebase is not initialized. Please try again in a moment.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulSignIn(userCredential.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) {
        setError("Firebase is not initialized. Please try again in a moment.");
        return;
    }
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
        const userCredential = await signInWithPopup(auth, provider);
        // Create user document if it doesn't exist
        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
        await setDoc(userDocRef, { 
            id: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
        }, { merge: true });

        await handleSuccessfulSignIn(userCredential.user);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsGoogleLoading(false);
    }
  }

  const isButtonsDisabled = isLoading || isGoogleLoading || !auth;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <form onSubmit={handleSignIn}>
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Dices className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-4xl">Vizura</CardTitle>
            <CardDescription className="pt-2">RPG Companion</CardDescription>
        </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Sign-in Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="gm@vizura.app"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isButtonsDisabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isButtonsDisabled}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isButtonsDisabled}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="relative w-full">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isButtonsDisabled}>
                {isGoogleLoading ? 'Signing in with Google...' : (
                    <>
                        <GoogleIcon className="mr-2"/>
                        Sign In with Google
                    </>
                )}
            </Button>
             <p className="text-xs text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="underline text-primary hover:text-primary/80">
                    Sign up
                </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
