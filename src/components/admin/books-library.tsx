"use client";

import { useEffect, useState } from "react";
import { Trash2, Download, Share2, Eye, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type StorybookRecord = {
  id: string;
  child_name: string;
  child_age: number;
  gender: string;
  status: string;
  created_at: string;
  pages: Array<{ imageUrl?: string }>;
  pdf_url?: string;
};

const ADMIN_CODE = "3121";

export function BooksLibrary() {
  const [books, setBooks] = useState<StorybookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const res = await fetch("/api/admin/storybooks", {
        headers: { "x-admin-code": ADMIN_CODE },
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.storybooks ?? []);
      }
    } catch (err) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBook(id: string, name: string) {
    if (!confirm(`Delete ${name}'s book? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/storybooks/${id}`, {
        method: "DELETE",
        headers: { "x-admin-code": ADMIN_CODE },
      });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== id));
        toast.success("Book deleted");
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function copyShareLink(id: string) {
    const url = `${window.location.origin}/book/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied!");
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    generating: "bg-blue-100 text-blue-700",
    ready: "bg-green-100 text-green-700",
    approved: "bg-emerald-100 text-emerald-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-cream-50 p-6" style={{ background: "#F8F4EC" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-royal-blue" style={{ color: "#0A1628" }}>
              📚 Books Library
            </h1>
            <p className="text-gray-500 mt-1">All generated storybooks — share, download, or delete</p>
          </div>
          <Link
            href="/admin/storybook-generator"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #B98A19, #d4a843)" }}
          >
            <Plus className="w-4 h-4" />
            New Book
          </Link>
        </div>

        {/* Books grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No books yet</p>
            <Link href="/admin/storybook-generator" className="mt-4 inline-block text-amber-600 hover:underline">
              Generate your first book →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5"
              >
                {/* Cover thumbnail */}
                <div
                  className="w-16 h-20 rounded-lg flex-shrink-0 overflow-hidden"
                  style={{ background: "#0A1628" }}
                >
                  {book.pages?.[0]?.imageUrl ? (
                    <img
                      src={book.pages[0].imageUrl}
                      alt={book.child_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👑</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg">{book.child_name}&apos;s Kingdom Quest</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">Age {book.child_age} · {book.gender}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[book.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {book.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(book.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">{book.id}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/book/${book.id}`}
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => copyShareLink(book.id)}
                    className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                    title="Copy share link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/admin/storybook-generator?id=${book.id}`}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Open in generator"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteBook(book.id, book.child_name)}
                    disabled={deleting === book.id}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
