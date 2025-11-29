import { Button } from "@/components/ui/button";
import {
  Building,
  Building2,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  User,
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
import { useGetAllExamsQuery } from "@/app/api/examinationApi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ExamDataItem } from "@/app/api/examinationApi/types";

const Inpatient = () => {
  const [showNewBuilding, setShowNewBuilding] = useState(false);
  const [showDeleteWarnBuilding, setShowDeleteWarnBuilding] = useState(false);
  const [showUpdateBuilding, setShowUpdateBuilding] = useState(false);
  const [oneCorpus, setOneCorpus] = useState({});
  const navigate = useNavigate();
  const [searchExamsQuery, setSearchExamsQuery] = useState("");
  const [openPopover, setOpenPopover] = useState(false);
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
  const { data: examinations, isLoading: isExaminationsLoading } =
    useGetAllExamsQuery({
      page: 1,
      limit: 100,
      search: searchExamsQuery,
      status: "pending",
      is_roomed: true,
      treatment_type: "stasionar",
    });

  function handleSelExam(selExam: ExamDataItem) {
    setOpenPopover(false);
    const { rooms } = selExam as ExamDataItem;
    const roomId = rooms[rooms.length - 1]?.room_id;
    if (roomId) navigate(`/room/${roomId}`);
  }

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
              <Card className="mb-6">
                <Popover open={openPopover} onOpenChange={setOpenPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPopover}
                      className="w-full justify-between h-12 sm:h-14 text-sm sm:text-base"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="truncate">Беморни қидириш...</span>
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[calc(100vw-2rem)] sm:w-[600px] md:w-[700px] lg:w-[910px] p-0"
                    align="start"
                    side="bottom"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Исм, ID ёки телефон орқали қидириш..."
                        value={searchExamsQuery}
                        onValueChange={setSearchExamsQuery}
                        className="text-sm sm:text-base"
                      />
                      <CommandList>
                        <CommandEmpty className="p-4 text-sm sm:text-base">
                          Бемор топилмади
                        </CommandEmpty>
                        <CommandGroup>
                          {isLoading ? (
                            <CommandItem
                              disabled
                              className="py-3 justify-center"
                            >
                              Юкланмоқда...
                            </CommandItem>
                          ) : (
                            examinations?.data.map((e) => (
                              <CommandItem
                                key={e._id}
                                value={e._id}
                                onSelect={() => handleSelExam(e)}
                                className="py-3"
                              >
                                <div className="flex flex-col w-full">
                                  <span className="font-medium text-sm sm:text-base">
                                    {e.patient_id.fullname}
                                  </span>
                                  <div className="">
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                      {e.patient_id.phone}
                                      {" / "}
                                    </span>

                                    <span className="text-xs sm:text-sm font-semibold">
                                      {e.rooms[e.rooms.length - 1]
                                        ?.floor_number || 0}{" "}
                                      -қават,{" "}
                                      {e.rooms[e.rooms.length - 1]?.room_name ||
                                        "Номаълум"}{" "}
                                    </span>
                                  </div>
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {getCorpuses?.data.map((corpus) => (
                  <Card
                    key={corpus._id}
                    className={`p-4  transition-smooth relative ${
                      corpus.room_statistics.leaving_today > 0
                        ? "border-red-500 bg-red-100 hover:bg-red-200"
                        : "bg-green-100 border-green-500/50 hover:bg-green-200"
                    }`}
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

                      <p>
                        Chiqadigan:{" "}
                        {corpus.room_statistics.leaving_today > 0
                          ? corpus.room_statistics.leaving_today + " ta"
                          : "Yo'q"}
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
