import { Button } from "@/components/ui/button";
import {
  Building,
  Building2,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useGetCorpusesQuery } from "@/app/api/corpusApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Corpuses } from "@/app/api/corpusApi/types";
import { DeleteWarnBuilding, NewBuilding, UpdatedBuilding } from "./components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Inpatient = () => {
  const [showNewBuilding, setShowNewBuilding] = useState(false);
  const [showDeleteWarnBuilding, setShowDeleteWarnBuilding] = useState(false);
  const [showUpdateBuilding, setShowUpdateBuilding] = useState(false);
  const [oneCorpus, setOneCorpus] = useState({});
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [corpusNumber, setCorpusNumber] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { data: getCorpuses, isLoading } = useGetCorpusesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    corpus_number: corpusNumber,
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Korpuslar Рўйхати
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Барча Korpuslarni кўриш ва бошқариш
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setShowNewBuilding(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Янги Korpus
          </Button>
        </div>

        {isLoading ? (
          <Card className="card-shadow p-8 sm:p-12">
            <LoadingSpinner
              size="lg"
              text="Юкланмоқда..."
              className="justify-center"
            />
          </Card>
        ) : getCorpuses?.data && getCorpuses?.data.length > 0 ? (
          <>
            <Card className="card-shadow p-4 sm:p-8 xl:p-12 cursor-pointer">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {getCorpuses?.data.map((corpus) => (
                  <Card
                    key={corpus._id}
                    className={`p-4 bg-green-100 border-green-500/50 hover:bg-green-200 transition-smooth relative`}
                  >
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="default"
                            className="w-8 h-6 border-green-500/50 bg-transparent hover:bg-green-500/20"
                          >
                            <MoreHorizontal className="w-8 h-6 text-black" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowUpdateBuilding(true);
                                setOneCorpus(corpus);
                              }}
                              className="w-32 hover:bg-yellow-600 hover:text-white transition-smooth text-xs xl:text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Таҳрирлаш
                            </Button>
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowDeleteWarnBuilding(true);
                                setOneCorpus(corpus);
                              }}
                              className="w-32 hover:bg-red-600 hover:text-white transition-smooth text-xs xl:text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Ўчириш
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div
                      onClick={() => navigate(`/inpatient/${corpus._id}`)}
                      className="flex flex-col items-center text-center space-y-2"
                    >
                      <Building2 className="h-8 w-8" />
                      <div className="font-bold">
                        <span>Korpus: </span>
                        <Badge>{corpus.corpus_number}</Badge>
                      </div>
                      <span>
                        Хоналар сони: <strong>{corpus.total_rooms}</strong> та
                      </span>

                      <p className="text-sm font-medium">
                        {corpus.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card className="card-shadow p-4 sm:p-0">
            <EmptyState
              icon={Building}
              title={
                searchQuery || corpusNumber || currentPage > 1
                  ? "Ҳеч нарса топилмади"
                  : "Ҳали Korpuslar йўқ"
              }
              description={
                searchQuery || corpusNumber || currentPage > 1
                  ? "Қидирув сўзини текширинг ёки филтрни ўзгартиринг"
                  : "Биринчи Korpusni қўшиш учун қуйидаги тугмани босинг"
              }
              actionLabel={
                searchQuery || corpusNumber || currentPage > 1
                  ? "Филтрни тозалаш"
                  : "+ Янги Korpus Қўшиш"
              }
              onAction={() =>
                searchQuery || corpusNumber || currentPage > 1
                  ? (setSearchQuery(""), setCorpusNumber(0), setCurrentPage(1))
                  : setShowNewBuilding(true)
              }
            />
          </Card>
        )}
        {/* New Building Modal*/}
        <NewBuilding open={showNewBuilding} onOpenChange={setShowNewBuilding} />

        {/* Update Building Modal*/}
        <UpdatedBuilding
          open={showUpdateBuilding}
          onOpenChange={setShowUpdateBuilding}
          oneCorpus={oneCorpus as Corpuses}
        />

        {/* Delete Building Modal*/}
        <DeleteWarnBuilding
          open={showDeleteWarnBuilding}
          onOpenChange={setShowDeleteWarnBuilding}
          oneCorpus={oneCorpus as Corpuses}
        />
      </div>
    </div>
  );
};

export default Inpatient;
