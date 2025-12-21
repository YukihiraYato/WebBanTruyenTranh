export const CATEGORY_CODE_TO_NAME = {
  ART_ANIME_CHAR: "Art, Anime Character",
  MANGA: "Manga",
  F_BOOK: "Sách ngoại văn",
  VN_BOOK: "Sách tiếng Việt",
  ALL_CATEGORY: "Tất cả danh mục",
  LIGHT_NOVEL: "Tiểu thuyết",
} as const;
export type Category = {
  id: string
  name: string
  parent: Category | null
}
export const categories: Category[] = [
  {
    id: '1',
    name: 'ALL_CATEGORY',
    parent: null,
  },
  {
    id: '2',
    name: 'VN_BOOK',
    parent: {
      id: '1',
      name: 'ALL_CATEGORY',
      parent: null,
    },
  },
  {
    id: '3',
    name: 'F_BOOK',
    parent: {
      id: '1',
      name: 'ALL_CATEGORY',
      parent: null,
    },
  },
  {
    id: '4',
    name: 'LIGHT_NOVEL',
    parent: {
      id: '2',
      name: 'VN_BOOK',
      parent: {
        id: '1',
        name: 'ALL_CATEGORY',
        parent: null,
      },
    },
  },
  {
    id: '5',
    name: 'MANGA',
    parent: {
      id: '2',
      name: 'VN_BOOK',
      parent: {
        id: '1',
        name: 'ALL_CATEGORY',
        parent: null,
      },
    },
  },
  {
    id: '6',
    name: 'LIGHT_NOVEL',
    parent: {
      id: '3',
      name: 'F_BOOK',
      parent: {
        id: '1',
        name: 'ALL_CATEGORY',
        parent: null,
      },
    },
  },
  {
    id: '7',
    name: 'MANGA',
    parent: {
      id: '3',
      name: 'F_BOOK',
      parent: {
        id: '1',
        name: 'ALL_CATEGORY',
        parent: null,
      },
    },
  },
  {
    id: '8',
    name: 'ART_ANIME_CHAR',
    parent: {
      id: '3',
      name: 'F_BOOK',
      parent: {
        id: '1',
        name: 'ALL_CATEGORY',
        parent: null,
      },
    },
  },
]
/**
 * Hàm kiểm tra xem category của sách có hợp lệ với discount không.
 * Hỗ trợ duyệt ngược lên cha (Recursive/Traversal).
 * @param bookCategoryId - ID danh mục của cuốn sách
 * @param discountCategoryIds - Danh sách ID danh mục mà voucher hỗ trợ
 */
export const isCategoryEligible = (
  bookCategoryId: number | string, // Hỗ trợ cả string và number cho linh hoạt
  discountCategoryIds?: number[]
): boolean => {
  // 1. Nếu voucher không giới hạn danh mục (undefined hoặc rỗng) -> Cho phép hết
  if (!discountCategoryIds || discountCategoryIds.length === 0) return true;

  // 2. Tìm category object bắt đầu (dựa vào ID sách)
  let currentCategory = categories.find(
    (c) => c.id === bookCategoryId.toString()
  );

  // 3. Duyệt ngược từ con lên cha
  while (currentCategory) {
    // Kiểm tra xem ID hiện tại có nằm trong list được giảm giá không
    if (discountCategoryIds.includes(Number(currentCategory.id))) {
      return true; // Tìm thấy khớp (ở cấp con hoặc cấp cha)
    }

    // Không khớp thì leo lên cha kiểm tra tiếp
    currentCategory = currentCategory.parent;
  }

  // Leo lên đến đỉnh (parent = null) mà vẫn không khớp -> False
  return false;
};