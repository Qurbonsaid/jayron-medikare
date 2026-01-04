import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Body part keys for translation
const bodyPartKeys: Record<string, string> = {
  [BodyPartConstants.HEAD]: "head",
  [BodyPartConstants.NECK]: "neck",
  [BodyPartConstants.CHEST]: "chestCage",
  [BodyPartConstants.ABDOMEN]: "abdomen",
  [BodyPartConstants.PELVIS]: "pelvis",
  [BodyPartConstants.SPINE]: "spine",
  [BodyPartConstants.ARM]: "arm",
  [BodyPartConstants.LEG]: "leg",
  [BodyPartConstants.KNEE]: "knee",
  [BodyPartConstants.SHOULDER]: "shoulder",
  [BodyPartConstants.HAND]: "hand",
  [BodyPartConstants.FOOT]: "foot",
};

export const MedicalImageTab = () => {
  const { t } = useTranslation('radiology');
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
    if (typeof image.examination_id === "string") return t('common.unknown');
    const exam = image.examination_id as ExaminationInfo;
    if (typeof exam?.patient_id === "string") return t('common.unknown');
    return exam?.patient_id?.fullname || t('common.unknown');
  };

  const getImagingTypeName = (image: MedicalImage) => {
    if (typeof image.imaging_type_id === "string") return t('common.unknown');
    return (image.imaging_type_id as ImagingTypeInfo)?.name || t('common.unknown');
  };

  const getBodyPartLabel = (bodyPart: string | undefined) => {
    if (!bodyPart) return t('medicalImageTab.notSpecified');
    const key = bodyPartKeys[bodyPart];
    return key ? t(`bodyParts.${key}`) : bodyPart;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{t('medicalImageTab.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('medicalImageTab.description')}
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('medicalImageTab.addNewImage')}
        </Button>
      </div>

      <Card className="card-shadow mb-4">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  placeholder={t('medicalImageTab.searchPlaceholder')}
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
                <span className="ml-2">{t('medicalImageTab.clearSearch')}</span>
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
              {t('medicalImageTab.total')}:{" "}
              <span className="font-semibold text-foreground">
                {medicalImages?.pagination?.total || 0}
              </span>{" "}
              {t('medicalImageTab.image')}
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
            text={t('viewer.loading')}
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
                  <TableHead className="text-center">{t('medicalImageTab.patient')}</TableHead>
                  <TableHead className="text-center">{t('medicalImageTab.type')}</TableHead>
                  <TableHead className="text-center">{t('newMedicalImage.description')}</TableHead>
                  <TableHead className="text-center">
                    {t('medicalImageTab.bodyPart')}
                  </TableHead>
                  <TableHead className="text-center">{t('medicalImageTab.images')}</TableHead>
                  <TableHead className="text-center">{t('medicalImageTab.date')}</TableHead>
                  <TableHead className="text-center">{t('medicalImageTab.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalImages?.data.map((image, idx) => (
                  <TableRow key={image._id}>
                    <TableCell className="text-center font-bold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      <Tooltip>
                        <TooltipTrigger>
                          {image?.patient_id?.fullname.length > 20
                            ? image?.patient_id?.fullname.slice(0, 20) + "..."
                            : image?.patient_id?.fullname || t('unknown')}
                        </TooltipTrigger>

                        <TooltipContent>
                          {image?.patient_id?.fullname || t('unknown')}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {image?.imaging_type_id?.name}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      <Tooltip>
                        <TooltipTrigger>
                          {image?.description.length > 22
                            ? image?.description.slice(0, 20) + "..."
                            : image?.description || t('medicalImageTab.notSpecified')}
                        </TooltipTrigger>

                        <TooltipContent>
                          {image?.description || t('medicalImageTab.notSpecified')}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">
                      {getBodyPartLabel(image.body_part)}
                    </TableCell>
                    <TableCell className="text-center">
                      {image.image_paths?.length || 0}
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
                          {t('medicalImageTab.view')}
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
                                {t('medicalImageTab.edit')}
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
                                {t('medicalImageTab.delete')}
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
                        {image.description || t('medicalImageTab.notSpecified')}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        {image.image_paths?.length || 0} {t('medicalImageTab.image')} •{" "}
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
                            {t('medicalImageTab.edit')}
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
                            {t('medicalImageTab.delete')}
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
              {t('medicalImageTab.page')} {medicalImages.pagination.page} {t('medicalImageTab.of')}{" "}
              {medicalImages.pagination.pages} ({t('medicalImageTab.totalItems')}:{" "}
              {medicalImages.pagination.total} {t('medicalImageTab.items')})
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
                <span className="hidden sm:inline">{t('medicalImageTab.previous')}</span>
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
                <span className="hidden sm:inline">{t('medicalImageTab.next')}</span>
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
                ? t('medicalImageTab.nothingFound')
                : t('medicalImageTab.noMedicalImagesYet')
            }
            description={
              searchQuery || currentPage > 1
                ? t('medicalImageTab.checkSearchOrFilter')
                : t('medicalImageTab.addFirstImage')
            }
            actionLabel={
              searchQuery || currentPage > 1
                ? t('medicalImageTab.clearFilter')
                : t('medicalImageTab.addNewImageBtn')
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
