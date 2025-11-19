import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useGetAllMedicalImagesQuery } from "@/app/api/radiologyApi";
import {
  MedicalImage,
  PatientInfo,
  ImagingTypeInfo,
  ExaminationInfo,
} from "@/app/api/radiologyApi/types";
import {
  Eye,
  Filter,
  Image,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Edit,
} from "lucide-react";
import { IconLeft, IconRight } from "react-day-picker";
import { NewMedicalImage } from ".";
import { UpdateMedicalImage } from ".";
import { DeleteWarnMedicalImage } from ".";
import { ViewMedicalImage } from ".";
import { formatDate } from "date-fns";
import { BodyPartConstants } from "@/constants/BodyPart";

// Tana qismlari uchun o'zbek nomlari
const bodyPartLabels: Record<string, string> = {
  [BodyPartConstants.HEAD]: "Бош",
  [BodyPartConstants.NECK]: "Бўйин",
  [BodyPartConstants.CHEST]: "Кўкрак",
  [BodyPartConstants.ABDOMEN]: "Қорин",
  [BodyPartConstants.PELVIS]: "Тос",
  [BodyPartConstants.SPINE]: "Умуртқа поғонаси",
  [BodyPartConstants.ARM]: "Қўл",
  [BodyPartConstants.LEG]: "Оёқ",
  [BodyPartConstants.KNEE]: "Тиззя",
  [BodyPartConstants.SHOULDER]: "Елка",
  [BodyPartConstants.HAND]: "Кафт",
  [BodyPartConstants.FOOT]: "Тобан",
};

export const MedicalImageTab = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MedicalImage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: medicalImages, isLoading } = useGetAllMedicalImagesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  });

  const getPatientName = (image: MedicalImage) => {
    if (typeof image.examination_id === "string") return "Номаълум";
    const exam = image.examination_id as ExaminationInfo;
    if (typeof exam?.patient_id === "string") return "Номаълум";
    return exam?.patient_id?.fullname || "Номаълум";
  };

  const getImagingTypeName = (image: MedicalImage) => {
    if (typeof image.imaging_type_id === "string") return "Номаълум";
    return (image.imaging_type_id as ImagingTypeInfo)?.name || "Номаълум";
  };

  const getBodyPartLabel = (bodyPart: string | undefined) => {
    if (!bodyPart) return "Кўрсатилмаган";
    return bodyPartLabels[bodyPart] || bodyPart;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Тиббий тасвирлар</h2>
          <p className="text-sm text-muted-foreground">
            Беморларнинг барча МРТ, КТ, Рентген тасвирлари
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Янги таsvир қўшиш
        </Button>
      </div>

      <Card className="card-shadow mb-4">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  placeholder="Бемор номи ёки танасининг қисми бўйича қидириш..."
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

      {medicalImages &&
        medicalImages?.data &&
        medicalImages?.data.length > 0 && (
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              Жами:{" "}
              <span className="font-semibold text-foreground">
                {medicalImages?.pagination?.total || 0}
              </span>{" "}
              таsvир
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

      {isLoading ? (
        <Card className="card-shadow p-8 sm:p-12">
          <LoadingSpinner
            size="lg"
            text="Юкланмоқда..."
            className="justify-center"
          />
        </Card>
      ) : medicalImages?.data && medicalImages?.data.length > 0 ? (
        <>
          {/* Desktop Table */}
          <Card className="card-shadow hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">№</TableHead>
                  <TableHead className="text-center">Тавсиф</TableHead>
                  <TableHead className="text-center">
                    Танасининг қисми
                  </TableHead>
                  <TableHead className="text-center">Тасвирлар сони</TableHead>
                  <TableHead className="text-center">Сана</TableHead>
                  <TableHead className="text-center">Ҳаракатлар</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalImages?.data.map((image, idx) => (
                  <TableRow key={image._id}>
                    <TableCell className="text-center font-bold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {image.description || "Тавсиф берилмаган"}
                    </TableCell>
                    <TableCell className="text-center">
                      {getBodyPartLabel(image.body_part)}
                    </TableCell>
                    <TableCell className="text-center">
                      {image.image_paths?.length || 0} та
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(new Date(image.created_at), "dd.MM.yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowViewModal(true);
                          }}
                          className="hover:bg-primary hover:text-white transition-smooth"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Кўриш
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
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
                                  setSelectedImage(image);
                                  setShowUpdateModal(true);
                                }}
                                className="w-full hover:bg-yellow-600 hover:text-white transition-smooth"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Ўзгартириш
                              </Button>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedImage(image);
                                  setShowDeleteModal(true);
                                }}
                                className=" w-full hover:bg-red-600 hover:text-white transition-smooth"
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

          {/* Mobile Cards */}
          <div className="block lg:hidden space-y-3 sm:space-y-4">
            {medicalImages?.data.map((image, idx) => (
              <Card key={image._id} className="card-shadow relative">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex-1"
                      onClick={() => {
                        setSelectedImage(image);
                        setShowViewModal(true);
                      }}
                    >
                      <h3 className="font-semibold text-base sm:text-lg mb-1">
                        {(currentPage - 1) * itemsPerPage + idx + 1}.{" "}
                        {image.description || "Тавсиф берилмаган"}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        {image.image_paths?.length || 0} та таsvир •{" "}
                        {getBodyPartLabel(image.body_part)}
                      </p>
                      <p className="text-sm sm:text-sm text-muted-foreground">
                        {formatDate(new Date(image.created_at), "dd.MM.yyyy")}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
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
                              setSelectedImage(image);
                              setShowUpdateModal(true);
                            }}
                            className="w-full bg-yellow-600 text-white"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Ўзгартириш
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedImage(image);
                              setShowDeleteModal(true);
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
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-3 xl:px-6 py-2 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs xl:text-sm text-muted-foreground min-w-max">
              Sahifa {medicalImages.pagination.page} dan{" "}
              {medicalImages.pagination.pages} (Жами:{" "}
              {medicalImages.pagination.total} та)
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={medicalImages.pagination.prev === null}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="text-xs xl:text-sm"
              >
                <IconLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Олдинги</span>
              </Button>
              {(() => {
                const pages = [];
                const showPages = new Set<number>();

                showPages.add(1);
                if (medicalImages.pagination.pages > 1) {
                  showPages.add(medicalImages.pagination.pages);
                }

                for (
                  let i = Math.max(2, currentPage - 1);
                  i <=
                  Math.min(medicalImages.pagination.pages - 1, currentPage + 1);
                  i++
                ) {
                  showPages.add(i);
                }

                const sortedPages = Array.from(showPages).sort((a, b) => a - b);

                sortedPages.forEach((page, index) => {
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
                disabled={medicalImages.pagination.next === null}
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
            icon={Image}
            title={
              searchQuery || currentPage > 1
                ? "Ҳеч нарса топилмади"
                : "Ҳали тиббий тасвирлар йўқ"
            }
            description={
              searchQuery || currentPage > 1
                ? "Қидирув сўзини текширинг ёки филтрни ўзгартиринг"
                : "Биринчи тиббий тасвирни қўшиш учун қуйидаги тугмани босинг"
            }
            actionLabel={
              searchQuery || currentPage > 1
                ? "Филтрни тозалаш"
                : "+ Янги таsvир қўшиш"
            }
            onAction={() =>
              searchQuery || currentPage > 1
                ? (setSearchQuery(""),
                  setDebouncedSearch(""),
                  setCurrentPage(1))
                : setShowNewModal(true)
            }
          />
        </Card>
      )}

      <NewMedicalImage open={showNewModal} onOpenChange={setShowNewModal} />
      <UpdateMedicalImage
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        medicalImage={selectedImage}
      />
      <DeleteWarnMedicalImage
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        medicalImage={selectedImage}
      />
      <ViewMedicalImage
        open={showViewModal}
        onOpenChange={setShowViewModal}
        medicalImage={selectedImage}
      />
    </div>
  );
};
