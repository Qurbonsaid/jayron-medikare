import { useGetOneCorpusQuery } from "@/app/api/corpusApi";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { NewRoom } from "./components";
import { useState } from "react";

const InpatientDetails = () => {
  const { id } = useParams();
  const [showNewRoom, setShowNewRoom] = useState(false);
  const { data: getCorpus, isLoading } = useGetOneCorpusQuery(
    { id },
    { skip: !id }
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {`${getCorpus?.data.corpus_number || 0} - Korpus`}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Izoh: {getCorpus?.data.description}
            </p>
          </div>
          <Button
            onClick={() => setShowNewRoom(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Янги Xona
          </Button>
        </div>

        {/* New Room Modal */}
        <NewRoom open={showNewRoom} onOpenChange={setShowNewRoom} />
      </div>
    </div>
  );
};

export default InpatientDetails;
