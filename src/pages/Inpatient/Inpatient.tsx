import { useGetCorpusesQuery } from "@/app/api/corpusApi";
import { Corpuses } from "@/app/api/corpusApi/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePermission } from "@/hooks/usePermission";
import {
  Building,
  Building2,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteWarnBuilding, NewBuilding, UpdatedBuilding } from "./components";
import { PatientSearchModal } from "./components/PatientSearchModal";

const Inpatient = () => {
  const { t } = useTranslation("inpatient");
  const { canCreate, canUpdate, canDelete } = usePermission("inpatient");
  const [showNewBuilding, setShowNewBuilding] = useState(false);
  const [showDeleteWarnBuilding, setShowDeleteWarnBuilding] = useState(false);
  const [showUpdateBuilding, setShowUpdateBuilding] = useState(false);
  const [oneCorpus, setOneCorpus] = useState({});
  const navigate = useNavigate();
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [corpusNumber, setCorpusNumber] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { data: getCorpuses, isLoading } = useGetCorpusesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    corpus_number: corpusNumber,
  });


  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t("buildingsList")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("viewAndManageBuildings")}
            </p>
          </div>
          <div className="flex flex-col justify-between items-center gap-2">
            {canCreate && (
              <Button
                className="w-full"
                onClick={() => setShowNewBuilding(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("newBuilding")}
              </Button>
            )}
            <Button
              onClick={() => setShowPatientSearch(true)}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {t("searchPatient")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="card-shadow p-8 sm:p-12">
            <LoadingSpinner
              size="lg"
              text={t("loading")}
              className="justify-center"
            />
          </Card>
        ) : getCorpuses?.data && getCorpuses?.data.length > 0 ? (
          <>
            <Card className="card-shadow p-4 sm:p-8 xl:p-10 cursor-pointer">

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {getCorpuses?.data.map((corpus) => (
                  <Card
                    key={corpus._id}
                    className={`p-4  transition-smooth relative ${corpus.room_statistics.leaving_today > 0
                      ? "border-red-500 bg-red-100 hover:bg-red-200"
                      : "bg-green-100 border-green-500/50 hover:bg-green-200"
                      }`}
                  >
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div
                            className="w-8 h-6 flex items-center justify-center border border-green-500/50 bg-transparent hover:bg-green-500/20 rounded cursor-pointer"
                          >
                            <MoreHorizontal className="w-5 h-5 text-black" />
                          </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          {canUpdate && (
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
                                {t("edit")}
                              </Button>
                            </DropdownMenuItem>
                          )}

                          {canDelete && (
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
                                {t("delete")}
                              </Button>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div
                      onClick={() => navigate(`/inpatient/${corpus._id}`)}
                      className="flex flex-col items-center text-center space-y-2"
                    >
                      <Building2 className="h-8 w-8" />
                      <div className="font-bold">
                        <span>{t("building")}: </span>
                        <Badge>{corpus.corpus_number}</Badge>
                      </div>
                      <span>
                        {t("roomsCount")}: <strong>{corpus.total_rooms}</strong> {t("count")}
                      </span>

                      <p className="text-sm font-medium">
                        {corpus.description}
                      </p>

                      <p>
                        {t("leavingPatients")}:{" "}
                        {corpus.room_statistics.leaving_today > 0
                          ? corpus.room_statistics.leaving_today + " " + t("count")
                          : t("none")}
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
                  ? t("nothingFound")
                  : t("noBuildingsYet")
              }
              description={
                searchQuery || corpusNumber || currentPage > 1
                  ? t("checkSearchOrFilter")
                  : t("addFirstBuilding")
              }
              actionLabel={
                searchQuery || corpusNumber || currentPage > 1
                  ? t("clearFilter")
                  : t("addNewBuilding")
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

        {/* Patient Search Modal */}
        <PatientSearchModal
          open={showPatientSearch}
          onOpenChange={setShowPatientSearch}
        />
      </div>
    </div>
  );
};

export default Inpatient;
