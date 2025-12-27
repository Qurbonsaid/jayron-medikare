import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-muted/50 flex items-center justify-center">
          <FileQuestion className="w-16 h-16 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">{t('notFound.title')}</h2>
          <p className="text-muted-foreground">
            {t('notFound.description')}
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            {t('goBack')}
          </Button>
          <Button onClick={() => navigate("/")}>
            {t('goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
