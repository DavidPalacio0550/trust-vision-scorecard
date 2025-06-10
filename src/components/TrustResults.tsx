
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { EmotionData } from '@/utils/emotionAnalysis';

interface TrustResultsProps {
  trustPercentage: number;
  emotions: EmotionData;
  frames: string[];
  onNewAnalysis: () => void;
}

const TrustResults: React.FC<TrustResultsProps> = ({
  trustPercentage,
  emotions,
  frames,
  onNewAnalysis
}) => {
  const getTrustLevel = (percentage: number) => {
    if (percentage >= 70) return { level: 'Alta', color: 'trust-high', description: 'Persona altamente confiable' };
    if (percentage >= 40) return { level: 'Media', color: 'trust-medium', description: 'Confiabilidad moderada' };
    return { level: 'Baja', color: 'trust-low', description: 'Baja confiabilidad detectada' };
  };

  const trustInfo = getTrustLevel(trustPercentage);

  const emotionsList = [
    { key: 'happiness', label: 'Felicidad', value: emotions.happiness },
    { key: 'neutral', label: 'Neutral', value: emotions.neutral },
    { key: 'surprise', label: 'Sorpresa', value: emotions.surprise },
    { key: 'sadness', label: 'Tristeza', value: emotions.sadness },
    { key: 'anger', label: 'Enojo', value: emotions.anger },
    { key: 'fear', label: 'Miedo', value: emotions.fear },
    { key: 'disgust', label: 'Disgusto', value: emotions.disgust },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Resultado Principal */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Análisis de Confiabilidad Completado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`text-6xl font-bold text-${trustInfo.color}`}>
            {trustPercentage}%
          </div>
          
          <div>
            <div className={`text-xl font-semibold text-${trustInfo.color} mb-2`}>
              Confiabilidad: {trustInfo.level}
            </div>
            <p className="text-muted-foreground">{trustInfo.description}</p>
          </div>

          <div className="max-w-md mx-auto">
            <Progress 
              value={trustPercentage} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Análisis de Emociones */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Emociones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emotionsList.map(({ key, label, value }) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{value.toFixed(1)}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Frames Capturados */}
        <Card>
          <CardHeader>
            <CardTitle>Frames Capturados ({frames.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {frames.map((frame, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={frame}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-cover rounded border border-border"
                  />
                  <div className="text-xs text-center mt-1 text-muted-foreground">
                    {index + 1}s
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interpretación y Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretación del Análisis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Factores Positivos:</h3>
              <ul className="space-y-1 text-sm">
                {emotions.happiness > 20 && <li>• Alto nivel de felicidad detectado</li>}
                {emotions.neutral > 30 && <li>• Expresión neutral y controlada</li>}
                {emotions.surprise > 15 && <li>• Reacciones naturales apropiadas</li>}
                {trustPercentage > 50 && <li>• Patrones faciales consistentes</li>}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Áreas de Atención:</h3>
              <ul className="space-y-1 text-sm">
                {emotions.anger > 15 && <li>• Signos de tensión detectados</li>}
                {emotions.fear > 20 && <li>• Indicadores de nerviosismo</li>}
                {emotions.sadness > 25 && <li>• Expresiones de preocupación</li>}
                {trustPercentage < 50 && <li>• Inconsistencias en microexpresiones</li>}
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Este análisis está basado en patrones de expresión facial y debe 
              ser considerado como una herramienta de apoyo. Para decisiones importantes, 
              se recomienda combinar con otros métodos de evaluación.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={onNewAnalysis} size="lg" className="px-8">
          Realizar Nuevo Análisis
        </Button>
      </div>
    </div>
  );
};

export default TrustResults;
