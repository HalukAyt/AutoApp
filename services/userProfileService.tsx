/* eslint-disable @typescript-eslint/no-unused-vars */
import api from '@/api';
import { Alert, Platform } from 'react-native';
import { getAuthHeaders } from './authTokenService';

/**
 * Evrensel Fotoğraf Yükleme Fonksiyonu
 * @param imageUri Mobilden seçilen fotoğrafın yolu
 * @param endpoint Backend'deki URL (Örn: "/profile/uploadProfilePhoto")
 * @param photoName Dosya ismi (Örn: "profile" veya "cover")
 */
export const uploadImageToServer = async (imageUri: string, endpoint: string, photoName: string) => {
    try {
        const formData = new FormData();
        
        // Mobil cihazlarda dosya yolunu (URI) düzeltmek için
        const uri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

        formData.append("file", {
            uri: uri,
            name: `${photoName}.jpg`, // Dinamik dosya ismi
            type: "image/jpeg",
        } as any);
        
        const baseURL = api().defaults.baseURL; 
        
        const response = await fetch(`${baseURL}${endpoint}`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(await getAuthHeaders()),
            },
        });

        const photoTypeTR = photoName === 'cover' ? 'Kapak' : 'Profil';

        if (response.ok) {
            Alert.alert("Başarılı", `${photoTypeTR} fotoğrafınız başarıyla yüklendi.`);
            return true;
        } else {
            console.error("Sunucu Hatası:", await response.text());
            Alert.alert("Hata", `${photoTypeTR} fotoğrafı yüklenemedi: ` + response.status);
            return false;
        }

    } catch (error) {
        console.error("Fotoğraf yükleme hatası:", error);
        Alert.alert("Hata", "Fotoğraf yüklenirken bir hata oluştu.");
        return false;
    }
};