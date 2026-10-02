"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Layers, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface StudyProgram {
  id: string;
  code: string;
  name: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  prodi_code: string;
  semester: number;
}

export function StudyProgramManagerCard() {
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Tambah Prodi
  const [prodiCode, setProdiCode] = useState("");
  const [prodiName, setProdiName] = useState("");
  const [isProdiDialogOpen, setIsProdiDialogOpen] = useState(false);
  const [submittingProdi, setSubmittingProdi] = useState(false);

  // State Form Edit Prodi
  const [isEditProdiOpen, setIsEditProdiOpen] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<StudyProgram | null>(null);
  const [editProdiCode, setEditProdiCode] = useState("");
  const [editProdiName, setEditProdiName] = useState("");

  // State Form Tambah Course
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseSks, setCourseSks] = useState("3");
  const [courseProdiCode, setCourseProdiCode] = useState("");
  const [courseSemester, setCourseSemester] = useState("1");
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // State Form Edit Course
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editCourseCode, setEditCourseCode] = useState("");
  const [editCourseName, setEditCourseName] = useState("");
  const [editCourseSks, setEditCourseSks] = useState("3");
  const [editCourseProdiCode, setEditCourseProdiCode] = useState("");
  const [editCourseSemester, setEditCourseSemester] = useState("1");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: prodiData } = await supabase
      .from("study_programs")
      .select("*")
      .order("code", { ascending: true });

    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .order("code", { ascending: true });

    setStudyPrograms(prodiData || []);
    setCourses(courseData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function loadInitialData() {
      setLoading(true);
      const { data: prodiData } = await supabase
        .from("study_programs")
        .select("*")
        .order("code", { ascending: true });

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .order("code", { ascending: true });

      if (isMounted) {
        setStudyPrograms(prodiData || []);
        setCourses(courseData || []);
        setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler Tambah Prodi
  const handleAddProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodiCode || !prodiName) {
      toast.error("Kode dan Nama Prodi wajib diisi!");
      return;
    }

    setSubmittingProdi(true);
    const { error } = await supabase.from("study_programs").insert([
      { code: prodiCode.toUpperCase(), name: prodiName },
    ]);

    if (error) {
      toast.error(`Gagal menambah prodi: ${error.message}`);
    } else {
      toast.success("Program Studi berhasil ditambahkan!");
      setProdiCode("");
      setProdiName("");
      setIsProdiDialogOpen(false);
      fetchData();
    }
    setSubmittingProdi(false);
  };

  // Handler Edit Prodi
  const handleUpdateProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdi || !editProdiCode || !editProdiName) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    setSubmittingProdi(true);
    const { error } = await supabase
      .from("study_programs")
      .update({ code: editProdiCode.toUpperCase(), name: editProdiName })
      .eq("id", selectedProdi.id);

    if (error) {
      toast.error(`Gagal mengupdate prodi: ${error.message}`);
    } else {
      toast.success("Program Studi berhasil diperbarui!");
      setIsEditProdiOpen(false);
      fetchData();
    }
    setSubmittingProdi(false);
  };

  // Handler Hapus Prodi
  const handleDeleteProdi = async (id: string, code: string) => {
    if (!confirm(`Yakin ingin menghapus Prodi ${code}?`)) return;

    const { error } = await supabase.from("study_programs").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus prodi (mungkin masih terikat dengan mata kuliah).");
    } else {
      toast.success("Prodi berhasil dihapus.");
      fetchData();
    }
  };

  // Handler Tambah Course
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName || !courseProdiCode) {
      toast.error("Semua field utama wajib diisi!");
      return;
    }

    setSubmittingCourse(true);
    const { error } = await supabase.from("courses").insert([
      {
        code: courseCode.toUpperCase(),
        name: courseName,
        sks: parseInt(courseSks) || 3,
        prodi_code: courseProdiCode,
        semester: parseInt(courseSemester) || 1,
      },
    ]);

    if (error) {
      toast.error(`Gagal menambah mata kuliah: ${error.message}`);
    } else {
      toast.success("Mata kuliah berhasil ditambahkan!");
      setCourseCode("");
      setCourseName("");
      setIsCourseDialogOpen(false);
      fetchData();
    }
    setSubmittingCourse(false);
  };

  // Handler Edit Course
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !editCourseCode || !editCourseName || !editCourseProdiCode) {
      toast.error("Semua field utama wajib diisi!");
      return;
    }

    setSubmittingCourse(true);
    const { error } = await supabase
      .from("courses")
      .update({
        code: editCourseCode.toUpperCase(),
        name: editCourseName,
        sks: parseInt(editCourseSks) || 3,
        prodi_code: editCourseProdiCode,
        semester: parseInt(editCourseSemester) || 1,
      })
      .eq("id", selectedCourse.id);

    if (error) {
      toast.error(`Gagal mengupdate mata kuliah: ${error.message}`);
    } else {
      toast.success("Mata kuliah berhasil diperbarui!");
      setIsEditCourseOpen(false);
      fetchData();
    }
    setSubmittingCourse(false);
  };

  // Handler Hapus Course
  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus mata kuliah ${name}?`)) return;

    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus mata kuliah.");
    } else {
      toast.success("Mata kuliah berhasil dihapus.");
      fetchData();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Manajemen Kurikulum & Program Studi
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Kelola master data program studi dan mata kuliah yang terintegrasi dengan sistem penjadwalan lab.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="prodi" className="w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabsList className="h-10 p-1">
              <TabsTrigger value="prodi" className="text-xs gap-2">
                <Layers className="h-3.5 w-3.5" /> Program Studi ({studyPrograms.length})
              </TabsTrigger>
              <TabsTrigger value="courses" className="text-xs gap-2">
                <BookOpen className="h-3.5 w-3.5" /> Mata Kuliah ({courses.length})
              </TabsTrigger>
            </TabsList>

            <div>
              <TabsContent value="prodi" className="mt-0">
                <Dialog open={isProdiDialogOpen} onOpenChange={setIsProdiDialogOpen}>
                  <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/95 h-9 px-3 py-2">
                    <Plus className="h-3.5 w-3.5" /> Tambah Prodi
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddProdi}>
                      <DialogHeader>
                        <DialogTitle>Tambah Program Studi Baru</DialogTitle>
                        <DialogDescription>
                          Masukkan kode singkatan dan nama lengkap program studi.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="prodiCode">Kode Prodi (Contoh: DKV, DIK)</Label>
                          <Input
                            id="prodiCode"
                            placeholder="Misal: DKV"
                            value={prodiCode}
                            onChange={(e) => setProdiCode(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prodiName">Nama Program Studi</Label>
                          <Input
                            id="prodiName"
                            placeholder="Misal: Desain Komunikasi Visual"
                            value={prodiName}
                            onChange={(e) => setProdiName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsProdiDialogOpen(false)}
                        >
                          Batal
                        </Button>
                        <Button type="submit" disabled={submittingProdi}>
                          {submittingProdi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Simpan Prodi
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="courses" className="mt-0">
                <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                  <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/95 h-9 px-3 py-2">
                    <Plus className="h-3.5 w-3.5" /> Tambah Mata Kuliah
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <form onSubmit={handleAddCourse}>
                      <DialogHeader>
                        <DialogTitle>Tambah Mata Kuliah Baru</DialogTitle>
                        <DialogDescription>
                          Tentukan mata kuliah, SKS, semester, dan prodi pengampu.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="courseCode">Kode MK</Label>
                            <Input
                              id="courseCode"
                              placeholder="Misal: DKV101"
                              value={courseCode}
                              onChange={(e) => setCourseCode(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="courseSks">Jumlah SKS</Label>
                            <Input
                              id="courseSks"
                              type="number"
                              min="1"
                              max="6"
                              value={courseSks}
                              onChange={(e) => setCourseSks(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="courseName">Nama Mata Kuliah</Label>
                          <Input
                            id="courseName"
                            placeholder="Misal: Desain Web Lanjut"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="courseProdi">Program Studi</Label>
                            <Select
                              value={courseProdiCode}
                              onValueChange={(val) => setCourseProdiCode(val ?? "")}
                            >
                              <SelectTrigger id="courseProdi">
                                <SelectValue placeholder="Pilih Prodi" />
                              </SelectTrigger>
                              <SelectContent>
                                {studyPrograms.map((p) => (
                                  <SelectItem key={p.id} value={p.code}>
                                    {p.name} - {p.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="courseSemester">Semester</Label>
                            <Input
                              id="courseSemester"
                              type="number"
                              min="1"
                              max="8"
                              value={courseSemester}
                              onChange={(e) => setCourseSemester(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCourseDialogOpen(false)}
                        >
                          Batal
                        </Button>
                        <Button type="submit" disabled={submittingCourse}>
                          {submittingCourse && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Simpan Mata Kuliah
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </div>
          </div>

          {/* Tabel Program Studi */}
          <TabsContent value="prodi" className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-30">Kode</TableHead>
                    <TableHead>Nama Program Studi</TableHead>
                    <TableHead className="text-right w-28">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                        Memuat data prodi...
                      </TableCell>
                    </TableRow>
                  ) : studyPrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Belum ada data program studi.
                      </TableCell>
                    </TableRow>
                  ) : (
                    studyPrograms.map((prodi) => (
                      <TableRow key={prodi.id}>
                        <TableCell className="font-semibold">{prodi.code}</TableCell>
                        <TableCell>{prodi.name}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedProdi(prodi);
                              setEditProdiCode(prodi.code);
                              setEditProdiName(prodi.name);
                              setIsEditProdiOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDeleteProdi(prodi.id, prodi.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tabel Mata Kuliah */}
          <TabsContent value="courses" className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-25">Kode</TableHead>
                    <TableHead>Nama Mata Kuliah</TableHead>
                    <TableHead className="w-22.5">Prodi</TableHead>
                    <TableHead className="w-20">SKS</TableHead>
                    <TableHead className="w-22.5">Semester</TableHead>
                    <TableHead className="text-right w-28">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                        Memuat data mata kuliah...
                      </TableCell>
                    </TableRow>
                  ) : courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada data mata kuliah.
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((courseItem) => (
                      <TableRow key={courseItem.id}>
                        <TableCell className="font-mono text-xs">{courseItem.code}</TableCell>
                        <TableCell className="font-medium">{courseItem.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                            {courseItem.prodi_code}
                          </span>
                        </TableCell>
                        <TableCell>{courseItem.sks}</TableCell>
                        <TableCell>Sem {courseItem.semester}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedCourse(courseItem);
                              setEditCourseCode(courseItem.code);
                              setEditCourseName(courseItem.name);
                              setEditCourseSks(String(courseItem.sks));
                              setEditCourseProdiCode(courseItem.prodi_code);
                              setEditCourseSemester(String(courseItem.semester));
                              setIsEditCourseOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDeleteCourse(courseItem.id, courseItem.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Dialog Edit Prodi */}
      <Dialog open={isEditProdiOpen} onOpenChange={setIsEditProdiOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateProdi}>
            <DialogHeader>
              <DialogTitle>Edit Program Studi</DialogTitle>
              <DialogDescription>Perbarui informasi kode atau nama program studi.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editProdiCode">Kode Prodi</Label>
                <Input
                  id="editProdiCode"
                  value={editProdiCode}
                  onChange={(e) => setEditProdiCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProdiName">Nama Program Studi</Label>
                <Input
                  id="editProdiName"
                  value={editProdiName}
                  onChange={(e) => setEditProdiName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProdiOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submittingProdi}>
                {submittingProdi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Course */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleUpdateCourse}>
            <DialogHeader>
              <DialogTitle>Edit Mata Kuliah</DialogTitle>
              <DialogDescription>Perbarui detail informasi mata kuliah.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="editCourseCode">Kode MK</Label>
                  <Input
                    id="editCourseCode"
                    value={editCourseCode}
                    onChange={(e) => setEditCourseCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCourseSks">Jumlah SKS</Label>
                  <Input
                    id="editCourseSks"
                    type="number"
                    min="1"
                    max="6"
                    value={editCourseSks}
                    onChange={(e) => setEditCourseSks(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCourseName">Nama Mata Kuliah</Label>
                <Input
                  id="editCourseName"
                  value={editCourseName}
                  onChange={(e) => setEditCourseName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="editCourseProdi">Program Studi</Label>
                  <Select
                    value={editCourseProdiCode}
                    onValueChange={(val) => setEditCourseProdiCode(val ?? "")}
                  >
                    <SelectTrigger id="editCourseProdi">
                      <SelectValue placeholder="Pilih Prodi" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyPrograms.map((p) => (
                        <SelectItem key={p.id} value={p.code}>
                          {p.name} - {p.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCourseSemester">Semester</Label>
                  <Input
                    id="editCourseSemester"
                    type="number"
                    min="1"
                    max="8"
                    value={editCourseSemester}
                    onChange={(e) => setEditCourseSemester(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditCourseOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submittingCourse}>
                {submittingCourse && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}