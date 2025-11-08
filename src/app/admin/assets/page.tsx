
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Upload, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { useFirebaseApp, useUser, useCollection, useFirestore } from '@/firebase';
import { getStorage, ref, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, where, doc, deleteDoc } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';


const assetCategories = [
    'buildings',
    'inventory-item-images',
    'maps',
    'phase-crafts',
    'mounts-images',
    'portraits',
];

interface AssetItem {
    id: string; // Firestore document ID
    url: string;
    name: string;
    category: string;
    fullPath: string; // Storage path
    userId: string;
}

export default function AssetUploaderPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>(assetCategories[0]);
    const firebaseApp = useFirebaseApp();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [assetToDelete, setAssetToDelete] = useState<AssetItem | null>(null);

    const assetsQuery = useMemo(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'photoURLs'), where('category', '==', selectedCategory), where('userId', '==', user.uid));
    }, [firestore, user?.uid, selectedCategory]);

    const { data: assets, isLoading: isLoadingAssets, error: assetError } = useCollection<AssetItem>(assetsQuery);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !firebaseApp || !user || !firestore) {
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const storagePath = `uploads/${user.uid}/${selectedCategory}/${file.name}`;
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, storagePath);
        
        const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                toast({
                    title: 'Upload Failed',
                    description: error.message || 'There was an error uploading your file. Check storage rules and console for details.',
                    variant: 'destructive',
                });
                setIsUploading(false);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    const photoURLsCollection = collection(firestore, 'photoURLs');
                    await addDoc(photoURLsCollection, {
                        url: downloadURL,
                        name: file.name,
                        category: selectedCategory,
                        fullPath: storagePath,
                        userId: user.uid,
                        uploadedAt: serverTimestamp(),
                    });
                    
                    toast({
                        title: 'Upload Successful!',
                        description: `"${file.name}" is now available.`,
                    });
                } catch (error: any) {
                    console.error("Error saving metadata to Firestore:", error);
                    toast({
                        title: 'Upload Partially Failed',
                        description: 'The file was uploaded, but saving its metadata failed.',
                        variant: 'destructive',
                    });
                } finally {
                    setIsUploading(false);
                    setUploadProgress(0);
                    if(fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }
            }
        );
    };
    
    const handleDeleteAsset = async () => {
        if (!assetToDelete || !firestore || !firebaseApp) return;
        
        try {
            // 1. Delete from Firestore
            const docRef = doc(firestore, 'photoURLs', assetToDelete.id);
            await deleteDoc(docRef);

            // 2. Delete from Storage
            const storage = getStorage(firebaseApp);
            const storageRef = ref(storage, assetToDelete.fullPath);
            await deleteObject(storageRef);

            toast({
                title: "Asset Deleted",
                description: `"${assetToDelete.name}" has been removed.`,
            });
        } catch (error: any) {
             console.error("Delete error:", error);
              toast({
                title: 'Delete Failed',
                description: error.message || 'Could not delete the asset.',
                variant: 'destructive',
            });
        } finally {
            setAssetToDelete(null);
        }
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <ImageIcon className="h-6 w-6" />
                        Asset Uploader
                    </CardTitle>
                    <CardDescription>Upload your custom game assets to the correct category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.svg"
                            disabled={isUploading}
                        />
                         <div className="w-full max-w-xs space-y-2">
                            <Label htmlFor="category-select">Select Upload Category</Label>
                             <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isUploading}>
                                <SelectTrigger id="category-select">
                                    <SelectValue placeholder="Select a category..."/>
                                </SelectTrigger>
                                <SelectContent>
                                    {assetCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isUploading ? (
                            <div className="w-full max-w-sm text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">Uploading...</p>
                                <Progress value={uploadProgress} className="w-full" />
                            </div>
                        ) : (
                             <Button size="lg" onClick={handleUploadClick} disabled={!user}>
                                <Upload className="mr-2 h-5 w-5" />
                                Select and Upload Asset
                            </Button>
                        )}
                         <p className="text-xs text-muted-foreground mt-2">Files will be uploaded to the selected category in Firebase Storage.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Asset Gallery</CardTitle>
                    <CardDescription>A gallery of your uploaded assets for the &quot;{selectedCategory.replace(/-/g, ' ')}&quot; category.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingAssets ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                           {Array.from({ length: 10 }).map((_, i) => (
                               <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                           ))}
                        </div>
                    ) : assetError ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error Loading Assets</AlertTitle>
                            <AlertDescription>
                                Could not fetch your assets from storage. This might be due to a permissions issue.
                                <pre className="mt-2 text-xs bg-destructive/20 p-2 rounded-md overflow-x-auto">{assetError.message}</pre>
                            </AlertDescription>
                        </Alert>
                    ) : assets && assets.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {assets.map((asset) => (
                                <Card key={asset.id} className="group relative overflow-hidden">
                                    <div className="aspect-square w-full bg-muted">
                                        <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <p className="text-xs text-white truncate">{asset.name}</p>
                                    </div>
                                    <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => setAssetToDelete(asset)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                            <h3 className="text-xl font-semibold">No Assets Yet</h3>
                            <p className="text-muted-foreground">Your uploaded images will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

             <AlertDialog open={!!assetToDelete} onOpenChange={(isOpen) => !isOpen && setAssetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this asset?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{assetToDelete?.name}&quot; from both Firestore and Storage. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAsset}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
