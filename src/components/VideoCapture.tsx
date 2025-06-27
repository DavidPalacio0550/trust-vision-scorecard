import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoCapture as VideoCaptureUtil } from '@/utils/videoCapture';
import { emotionAnalyzer, EmotionData } from '@/utils/emotionAnalysis';
import { downloadFramesAsZip, downloadIndividualFrames } from '@/utils/fileDownload';
import { useToast } from '@/hooks/use-toast';
import { Download, FolderDown } from 'lucide-react';

interface VideoRecordingProps {
  onAnalysisComplete: (result: {
    trustPercentage: number;
    emotions: EmotionData;
    frames: string[];
  }) => void;
}

const VideoRecording: React.FC<VideoRecordingProps> = ({ onAnalysisComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<string>('');
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [videoCapture] = useState(() => new VideoCaptureUtil());
  const { toast } = useToast();

  useEffect(() => {
    initializeCamera();
    loadEmotionModel();
    
    return () => {
      videoCapture.stopCapture();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await videoCapture.startCapture();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive",
      });
    }
  };

  const loadEmotionModel = async () => {
    try {
      await emotionAnalyzer.loadModel();
      toast({
        title: "Modelo cargado",
        description: "El sistema de análisis está listo",
      });
    } catch (error) {
      toast({
        title: "Error del modelo",
        description: "No se pudo cargar el modelo de análisis",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    setProgress(0);
    setCapturedFrames([]);
    
    const frames: string[] = [];
    let frameCount = 0;

    try {
      const recordingPromise = videoCapture.startRecording((imageData) => {
        frames.push(imageData);
        setCapturedFrames([...frames]);
        frameCount++;
        
        // Actualizar progreso
        const progressPercent = (frameCount / 15) * 100;
        setProgress(progressPercent);

        // Análisis en tiempo real (simulado)
        analyzeFrameRealTime(imageData);
      });

      // Simular progreso visual
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + (100 / 15);
        });
      }, 1000);

      await recordingPromise;
      
      // Procesar todos los frames al final
      await processAllFrames(frames);
      
    } catch (error) {
      toast({
        title: "Error de grabación",
        description: "Hubo un problema durante la grabación",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const analyzeFrameRealTime = async (imageData: string) => {
    try {
      const analysis = await emotionAnalyzer.analyzeImage(imageData);
      
      // Encontrar la emoción dominante
      const emotions = analysis.emotions;
      const dominantEmotion = Object.entries(emotions).reduce((a, b) => 
        emotions[a[0] as keyof EmotionData] > emotions[b[0] as keyof EmotionData] ? a : b
      )[0];
      
      setCurrentEmotion(translateEmotion(dominantEmotion));
    } catch (error) {
      console.error('Error analyzing frame:', error);
    }
  };

  const processAllFrames = async (frames: string[]) => {
    if (frames.length === 0) return;

    toast({
      title: "Procesando análisis",
      description: "Analizando todas las capturas...",
    });

    // Analizar el último frame para el resultado final
    const finalFrame = frames[frames.length - 1];
    const analysis = await emotionAnalyzer.analyzeImage(finalFrame);

    onAnalysisComplete({
      trustPercentage: analysis.trustScore,
      emotions: analysis.emotions,
      frames: frames
    });

    toast({
      title: "Análisis completado",
      description: `Confiabilidad detectada: ${analysis.trustScore}%`,
    });
  };

  const translateEmotion = (emotion: string): string => {
    const translations: { [key: string]: string } = {
      happiness: 'Felicidad',
      sadness: 'Tristeza',
      anger: 'Enojo',
      fear: 'Miedo',
      surprise: 'Sorpresa',
      disgust: 'Disgusto',
      neutral: 'Neutral'
    };
    return translations[emotion] || emotion;
  };

  const handleDownloadAsZip = async () => {
    if (capturedFrames.length === 0) {
      toast({
        title: "Sin capturas",
        description: "No hay capturas para descargar",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentUser = authService.getCurrentUser();
      const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'usuario';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const folderName = `capturas_${userName}_${timestamp}`;
      
      await downloadFramesAsZip(capturedFrames, folderName);
      
      toast({
        title: "Descarga completada",
        description: `Capturas guardadas en ${folderName}.zip`,
      });
    } catch (error) {
      toast({
        title: "Error de descarga",
        description: "No se pudieron descargar las capturas",
        variant: "destructive",
      });
    }
  };

  const handleDownloadIndividual = () => {
    if (capturedFrames.length === 0) {
      toast({
        title: "Sin capturas",
        description: "No hay capturas para descargar",
        variant: "destructive",
      });
      return;
    }

    downloadIndividualFrames(capturedFrames);
    
    toast({
      title: "Descarga iniciada",
      description: "Las capturas se están descargando individualmente",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Captura de Video para Análisis de Emociones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full max-w-md mx-auto rounded-lg shadow-lg border-2 border-primary/20"
            style={{ aspectRatio: '4/3' }}
          />
          
          {isRecording && (
            <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium recording-pulse">
              ● GRABANDO
            </div>
          )}
        </div>

        {isRecording && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso de grabación</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="progress-animation" />
            </div>
            
            {currentEmotion && (
              <div className="text-center">
                <p className="text-lg font-medium">
                  Emoción detectada: <span className="text-primary">{currentEmotion}</span>
                </p>
              </div>
            )}
            
            <div className="text-center text-sm text-muted-foreground">
              Capturando {capturedFrames.length}/15 frames
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <Button
            onClick={startRecording}
            disabled={isRecording}
            size="lg"
            className="px-8"
          >
            {isRecording ? 'Grabando... (15s)' : 'Iniciar Análisis'}
          </Button>

          {capturedFrames.length > 0 && !isRecording && (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleDownloadAsZip}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FolderDown className="w-4 h-4" />
                Descargar como ZIP
              </Button>
              
              <Button
                onClick={handleDownloadIndividual}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Individual
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground text-center space-y-1">
          <p>• La grabación durará exactamente 15 segundos</p>
          <p>• Se capturará 1 frame por segundo para análisis</p>
          <p>• Las capturas se guardarán con el nombre del usuario</p>
          <p>• Mantén una expresión natural durante la grabación</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoRecording;
