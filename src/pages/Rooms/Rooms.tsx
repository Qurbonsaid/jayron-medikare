import { useGetOneCorpusQuery } from "@/app/api/corpusApi";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { NewRoom } from "./components";
import { useState, useEffect } from "react";
import { useGetAllRoomsQuery } from "@/app/api/roomApi";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLeft, IconRight } from "react-day-picker";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpdateRoom } from "./components/updateRoom";
import { Room } from "@/app/api/roomApi/types";
import { DeleteWarnRoom } from "./components/deleteWarnRoom";

const Rooms = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [showUpdateRoom, setShowUpdateRoom] = useState(false);
  const [showDeleteWarnRoom, setShowDeleteWarnRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: getCorpus, isLoading } = useGetOneCorpusQuery(
    { id },
    { skip: !id }
  );
  const { data: getRooms, isLoading: roomsLoading } = useGetAllRoomsQuery(
    {
      corpus_id: id,
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
    },
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
              Izoh: {getCorpus?.data.description} / Хоналар сони:{" "}
              {getCorpus?.data.total_rooms || 0} та
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

        <Card className="card-shadow mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
              <div className="sm:col-span-2 lg:col-span-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    placeholder="Хоналар номи ёки тавсиф бўйича қидириш..."
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
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
                    setDebouncedSearch("");
                    setCurrentPage(1);
                  }}
                  disabled={!searchQuery && currentPage === 1}
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-2">Қидирувни тозалаш</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {getRooms && getRooms?.data && getRooms?.data.length > 0 && (
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              Жами:{" "}
              <span className="font-semibold text-foreground">
                {getRooms?.pagination?.total_items || 0}
              </span>{" "}
              Xona
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
        )}

        {roomsLoading ? (
          <Card className="card-shadow p-8 sm:p-12">
            <LoadingSpinner
              size="lg"
              text="Юкланмоқда..."
              className="justify-center"
            />
          </Card>
        ) : getRooms?.data && getRooms?.data.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <Card className="card-shadow hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">№</TableHead>
                    <TableHead className="text-center">Xona nomi</TableHead>
                    <TableHead className="text-center">Xona narxi</TableHead>
                    <TableHead className="text-center">Sig'im</TableHead>
                    <TableHead className="text-center">Bandlik</TableHead>
                    <TableHead className="text-center">Xona qavatı</TableHead>
                    <TableHead className="text-center">Tavsif</TableHead>
                    <TableHead className="text-center">Harakatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getRooms?.data.map((room, idx) => (
                    <TableRow key={room._id}>
                      <TableCell className="text-center font-bold">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </TableCell>

                      <TableCell className="text-center">
                        {room.room_name}
                      </TableCell>

                      <TableCell className="text-center">
                        {room.room_price.toLocaleString()} so'm
                      </TableCell>

                      <TableCell className="text-center">
                        {room.patient_capacity} kishilik
                      </TableCell>

                      <TableCell className="text-center">
                        {room.patient_occupied
                          ? room.patient_occupied === room.patient_capacity
                            ? "To'liq band"
                            : `${room.patient_occupied} ta band`
                          : "Bo'sh"}
                      </TableCell>

                      <TableCell className="text-center">
                        {room.floor_number} - qavat
                      </TableCell>

                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger>
                            <span>
                              {room.description
                                ? room.description.length > 20
                                  ? room.description.slice(0, 20) + "..."
                                  : room.description
                                : "Berilmagan"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {room.description || "Berilmagan"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            // onClick={() => navigate(`/rooms/${room._id}`)}
                            className="hover:bg-primary hover:text-white transition-smooth"
                          >
                            <Eye className="w-4 h-4" />
                            Кўриш
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setShowUpdateRoom(true);
                                    setSelectedRoom(room);
                                  }}
                                  className="w-full justify-start hover:bg-yellow-600 hover:text-white transition-smooth"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Таҳрирлаш
                                </Button>
                              </DropdownMenuItem>

                              <DropdownMenuItem>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setShowDeleteWarnRoom(true);
                                    setSelectedRoom(room);
                                  }}
                                  className="w-full justify-start hover:bg-red-600 hover:text-white transition-smooth"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Ўчириш
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 sm:space-y-4">
              {getRooms?.data.map((room) => (
                <Card key={room._id} className="card-shadow relative">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg mb-1">
                          {room.room_name}{" "}
                          <span className="text-sm">
                            Qavat: {room.floor_number}
                          </span>
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {room.description || "Izoh berilmagan"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>Xona narxi {room.room_price} so'm</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>
                          Sig'im: {room.patient_capacity} kishilik | Bandlik:{" "}
                          {room.patient_occupied
                            ? room.patient_occupied === room.patient_capacity
                              ? "To'liq band"
                              : `${room.patient_occupied} ta band`
                            : "bo'sh"}
                        </span>
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
                                setShowUpdateRoom(true);
                                setSelectedRoom(room);
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
                                setShowDeleteWarnRoom(true);
                                setSelectedRoom(room);
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
                      // onClick={() => navigate(`/inpatient/${corpus._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Кўриш
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-3 xl:px-6 py-2 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs xl:text-sm text-muted-foreground min-w-max">
                  Sahifa {getRooms.pagination.page} dan{" "}
                  {getRooms.pagination.total_pages} (Жами:{" "}
                  {getRooms.pagination.total_items} та)
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={getRooms.pagination.prev_page === null}
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
                  if (getRooms.pagination.total_pages > 1) {
                    showPages.add(getRooms.pagination.total_pages);
                  }

                  // Joriy sahifa va uning atrofidagi sahifalarni ko'rsat
                  for (
                    let i = Math.max(2, currentPage - 1);
                    i <=
                    Math.min(
                      getRooms.pagination.total_pages - 1,
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
                  disabled={getRooms.pagination.next_page === null}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="text-xs xl:text-sm"
                >
                  <span className="hidden sm:inline">Кейинги</span>
                  <IconRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card className="card-shadow p-4 sm:p-0">
            <EmptyState
              icon={Building2}
              title={
                searchQuery || currentPage > 1
                  ? "Ҳеч нарса топилмади"
                  : "Ҳали Xonалар йўқ"
              }
              description={
                searchQuery || currentPage > 1
                  ? "Қидирув сўзини текширинг ёки филтрни ўзгартиринг"
                  : "Биринчи Xonани қўшиш учун қуйидаги тугмани босинг"
              }
              actionLabel={
                searchQuery || currentPage > 1
                  ? "Филтрни тозалаш"
                  : "+ Янги Xona Қўшиш"
              }
              onAction={() =>
                searchQuery || currentPage > 1
                  ? (setSearchQuery(""),
                    setDebouncedSearch(""),
                    setCurrentPage(1))
                  : setShowNewRoom(true)
              }
            />
          </Card>
        )}

        {/* New Room Modal */}
        <NewRoom open={showNewRoom} onOpenChange={setShowNewRoom} />

        {/* Update Room Modal */}
        <UpdateRoom
          open={showUpdateRoom}
          onOpenChange={(value) => {
            setShowUpdateRoom(value);
            setSelectedRoom({});
          }}
          room={selectedRoom as Room}
        />

        {/* Delete Room Modal */}
        <DeleteWarnRoom
          open={showDeleteWarnRoom}
          onOpenChange={setShowDeleteWarnRoom}
          room={selectedRoom as Room}
        />
      </div>
    </div>
  );
};

export default Rooms;
