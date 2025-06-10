
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emotionAnalyzer } from '@/utils/emotionAnalysis';
import { useToast } from '@/hooks/use-toast';

interface TrainingData {
  image: string;
  label: 'trustworthy' | 'untrustworthy';
  timestamp: Date;
}

const TrainingDashboard: React.FC = () => {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState<'trustworthy' | 'untrustworthy'>('trustworthy');
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const newTrainingItem: TrainingData = {
        image: imageData,
        label: selectedLabel,
        timestamp: new Date()
      };
      
      setTrainingData(prev => [...prev, newTrainingItem]);
      toast({
        title: "Imagen añadida",
        description: `Imagen etiquetada como ${selectedLabel === 'trustworthy' ? 'confiable' : 'no confiable'}`,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeTrainingItem = (index: number) => {
    setTrainingData(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Imagen eliminada",
      description: "La imagen ha sido removida del conjunto de entrenamiento",
    });
  };

  const startTraining = async () => {
    if (trainingData.length < 10) {
      toast({
        title: "Datos insuficientes",
        description: "Necesitas al menos 10 imágenes para entrenar el modelo",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    try {
      // Simular progreso de entrenamiento
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 200);

      await emotionAnalyzer.trainModel(trainingData);
      
      toast({
        title: "¡Entrenamiento completado!",
        description: `Modelo entrenado exitosamente con ${trainingData.length} imágenes`,
      });
    } catch (error) {
      toast({
        title: "Error en el entrenamiento",
        description: "Hubo un problema durante el entrenamiento del modelo",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  };

  const trustworthyCount = trainingData.filter(item => item.label === 'trustworthy').length;
  const untrustworthyCount = trainingData.filter(item => item.label === 'untrustworthy').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dashboard de Entrenamiento de ML</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{trainingData.length}</div>
                <p className="text-muted-foreground">Total de imágenes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-trust-high">{trustworthyCount}</div>
                <p className="text-muted-foreground">Confiables</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-trust-low">{untrustworthyCount}</div>
                <p className="text-muted-foreground">No confiables</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Subir Datos</TabsTrigger>
              <TabsTrigger value="dataset">Dataset</TabsTrigger>
              <TabsTrigger value="train">Entrenar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Añadir Imágenes de Entrenamiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Etiqueta para la imagen</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="trustworthy"
                          checked={selectedLabel === 'trustworthy'}
                          onChange={(e) => setSelectedLabel(e.target.value as 'trustworthy')}
                        />
                        <span className="text-trust-high font-medium">Confiable</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="untrustworthy"
                          checked={selectedLabel === 'untrustworthy'}
                          onChange={(e) => setSelectedLabel(e.target.value as 'untrustworthy')}
                        />
                        <span className="text-trust-low font-medium">No confiable</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Seleccionar imagen</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>• Sube imágenes claras de rostros</p>
                    <p>• Etiqueta correctamente cada imagen</p>
                    <p>• Se recomienda al menos 10 imágenes de cada categoría</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="dataset" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conjunto de Datos de Entrenamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {trainingData.map((item, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={item.image}
                          alt={`Training ${index}`}
                          className="w-full aspect-square object-cover rounded border"
                        />
                        <div className={`absolute bottom-0 left-0 right-0 p-2 text-xs text-white rounded-b ${
                          item.label === 'trustworthy' ? 'bg-trust-high' : 'bg-trust-low'
                        }`}>
                          {item.label === 'trustworthy' ? 'Confiable' : 'No confiable'}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeTrainingItem(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="train" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Entrenar Modelo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isTraining && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso del entrenamiento</span>
                        <span>{trainingProgress}%</span>
                      </div>
                      <Progress value={trainingProgress} />
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Datos disponibles: {trainingData.length} imágenes</p>
                    <p>• Confiables: {trustworthyCount} imágenes</p>
                    <p>• No confiables: {untrustworthyCount} imágenes</p>
                    <p>• Mínimo requerido: 10 imágenes total</p>
                  </div>
                  
                  <Button
                    onClick={startTraining}
                    disabled={isTraining || trainingData.length < 10}
                    size="lg"
                    className="w-full"
                  >
                    {isTraining ? 'Entrenando...' : 'Iniciar Entrenamiento'}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Nota:</strong> El entrenamiento puede tomar varios minutos dependiendo 
                    del tamaño del dataset. El modelo se actualizará automáticamente después del entrenamiento.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingDashboard;
