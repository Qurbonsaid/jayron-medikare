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
  const [tableHead] = useState<string[]>([
    "N/#",
    "Korpus raqami",
    "Xonalar soni",
    "Izoh",
    "Ҳаракатлар",
  ]);
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

        {/* <Card className="card-shadow mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
              <div className="sm:col-span-2 lg:col-span-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    placeholder="Korpus izohi бўйича қидириш..."
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="lg:col-span-4">
                <Button
                  variant="outline"
                  className="w-full h-10 sm:h-12"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                    setCorpusNumber(0);
                  }}
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-2">Тозалаш</span>
                </Button>
              </div>
            </div>
          </div>
        </Card> */}

        {/* {getCorpuses && getCorpuses?.data && getCorpuses?.data.length > 0 && (
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              Жами:{" "}
              <span className="font-semibold text-foreground">
                {getCorpuses?.data.length}
              </span>{" "}
              Korpus
            </p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32 h-9 sm:h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )} */}

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

            {/* Mobile Card View */}
            {/* <div className="block lg:hidden space-y-3 sm:space-y-4">
              {getCorpuses?.data.map((corpus) => (
                <Card key={corpus._id} className="card-shadow relative">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg mb-1">
                          {corpus.corpus_number} chi Korpus
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {corpus.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>xonalar soni {corpus.total_rooms} ta</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
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
                              className="w-full bg-yellow-600 text-white"
                            >
                              <Edit className="w-4 h-4 mr-2" />
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
                              className="w-full bg-red-600 text-white"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Ўчириш
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button
                      size="sm"
                      className="w-full gradient-primary"
                      onClick={() => navigate(`/inpatient/${corpus._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Кўриш
                    </Button>
                  </div>
                </Card>
              ))}
            </div> */}

            {/* Desktop Table View */}
            {/* <Card className="card-shadow hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {tableHead.map((i) => (
                        <th
                          key={i}
                          className="px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-semibold"
                        >
                          {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {getCorpuses?.data.map((corpus, idx) => (
                      <tr
                        key={corpus._id}
                        className="hover:bg-accent/50 transition-smooth text-center"
                      >
                        <td className="px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-bold">
                          {idx + 1}
                        </td>

                        <td className="px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm">
                          {corpus.corpus_number} - Korpus
                        </td>

                        <td className="px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm">
                          {corpus.total_rooms} ta xona
                        </td>

                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <div className="text-sm xl:text-base">
                            <Tooltip>
                              <TooltipContent>
                                {corpus.description}
                              </TooltipContent>
                              <TooltipTrigger>
                                <span>
                                  {corpus.description.length > 20
                                    ? corpus.description.slice(0, 20) + "..."
                                    : corpus.description}
                                </span>
                              </TooltipTrigger>
                            </Tooltip>
                          </div>
                        </td>

                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/inpatient/${corpus._id}`)
                              }
                              className="hover:bg-primary hover:text-white transition-smooth text-xs xl:text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Кўриш
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="outline" className="w-8 h-8">
                                  <MoreHorizontal className="w-4 h-4" />
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card> */}

            {/* Pagination */}
            {/* <div className="px-3 xl:px-6 py-2 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs xl:text-sm text-muted-foreground min-w-max">
                  Sahifa {getCorpuses.pagination.page} dan{" "}
                  {getCorpuses.pagination.total_pages}
                </div>

                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 sm:w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={getCorpuses.pagination.prev_page === null}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="text-xs xl:text-sm"
                >
                  <IconLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Олдинги</span>
                </Button>
                {(() => {
                  const pages = [];
                  const showPages = new Set<number>();

                  // Har doim 1-sahifani ko'rsat
                  showPages.add(1);

                  // Har doim oxirgi sahifani ko'rsat
                  if (getCorpuses.pagination.total_pages > 1) {
                    showPages.add(getCorpuses.pagination.total_pages);
                  }

                  // Joriy sahifa va uning atrofidagi sahifalarni ko'rsat
                  for (
                    let i = Math.max(2, currentPage - 1);
                    i <=
                    Math.min(
                      getCorpuses.pagination.total_pages - 1,
                      currentPage + 1
                    );
                    i++
                  ) {
                    showPages.add(i);
                  }

                  const sortedPages = Array.from(showPages).sort(
                    (a, b) => a - b
                  );

                  sortedPages.forEach((page, index) => {
                    // Ellipsis qo'shish agar sahifalar orasida bo'sh joy bo'lsa
                    if (index > 0 && sortedPages[index - 1] !== page - 1) {
                      pages.push(
                        <span
                          key={`ellipsis-${page}`}
                          className="px-1 flex items-center text-xs xl:text-sm"
                        >
                          ...
                        </span>
                      );
                    }

                    // Sahifa tugmasi
                    pages.push(
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`text-xs xl:text-sm ${
                          page === currentPage
                            ? "bg-primary text-white hover:bg-primary/60 hover:text-white"
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  });

                  return pages;
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={getCorpuses.pagination.next_page === null}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="text-xs xl:text-sm"
                >
                  <span className="hidden sm:inline">Кейинги</span>
                  <IconRight className="w-4 h-4" />
                </Button>
              </div>
            </div> */}
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
