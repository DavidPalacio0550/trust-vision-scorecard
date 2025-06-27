
import { authService } from './auth';

export const createUserFolder = (frames: string[]) => {
  const currentUser = authService.getCurrentUser();
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'usuario';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    folderName: `capturas_${userName}_${timestamp}`,
    frames
  };
};

export const downloadFramesAsZip = async (frames: string[], folderName: string) => {
  // Crear un archivo ZIP en memoria usando JSZip
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  // Crear carpeta con el nombre del usuario
  const folder = zip.folder(folderName);
  
  // Añadir cada frame al ZIP
  frames.forEach((frame, index) => {
    // Convertir data URL a blob
    const base64Data = frame.split(',')[1];
    folder?.file(`captura_${index + 1}.jpg`, base64Data, { base64: true });
  });
  
  // Generar el ZIP y descargarlo
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar la URL
  URL.revokeObjectURL(url);
};

export const downloadIndividualFrames = (frames: string[]) => {
  const currentUser = authService.getCurrentUser();
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'usuario';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  frames.forEach((frame, index) => {
    const link = document.createElement('a');
    link.href = frame;
    link.download = `${userName}_captura_${index + 1}_${timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
