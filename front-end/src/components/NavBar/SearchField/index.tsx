import { Box, Button, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSearchContext } from "~/providers/SearchProvider";
import { useDebounce } from "~/custom_hook/useDebounce";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { searchBooks } from "~/api/book";
import { getSearchHistory, saveSearchKeyword, deleteSearchHistory } from "~/api/user/searchHistory";
import { searchRedeemReward } from "~/api/redeemReward";
import { Select, MenuItem } from "@mui/material";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
interface SearchBookParams {
  context?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}
export function SearchField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setLoading] = useState(false);
  const [isWatingKeyword, setIsWatingKeyword] = useState(false);
  const {
    searchKeyword,
    setSearchKeyword,
    searchResults,
    setSearchResults,
    filters,
    setIsResetDefaultFilters,
    searchType,
    setSearchType
  } = useSearchContext();
  const [history, setHistory] = useState([]);
  const [visible, setVisible] = useState(false);
  const {  setKeyword} = useRedeemReward();
  useEffect(() => {
    setIsResetDefaultFilters(true);
  }, [setIsResetDefaultFilters]);


  // Xài kỹ thuật debounce để tránh việc gọi API liên tục khi người dùng gõ
  const debounce = useDebounce(searchKeyword, 700) ?? "";
  useEffect(() => {
    if (debounce.trim() === "") {
      return;
    }

    setLoading(true);

    if (searchType === "BOOK") {
      searchBooks({
        context: debounce,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        page: filters.page,
        size: 5,
      } as SearchBookParams)
        .then((res) => {
          setSearchResults(res.result.content);
        })
        .catch((error) => console.error("Error fetching books:", error))
        .finally(() => setLoading(false));
    } else if (searchType === "REWARD") {
      searchRedeemReward(debounce, filters.page, 5)
        .then((res) => {
          setSearchResults(res.content);
        })
        .catch((error) => console.error("Error fetching rewards:", error))
        .finally(() => setLoading(false));
    }
  }, [debounce, searchType]);

  const handleClearResult = () => {
    setSearchKeyword(""); // Xóa ô input
    setKeyword("");
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).focus();
    }
  };
  const handleSearchSubmit = () => {

    if (searchType === "BOOK") {
      const url = `/category?categoryId=1&page=1&size=12&context=${searchKeyword}`;
      saveSearchKeyword(searchKeyword)
        .then(() => {
          if (location.pathname === "/category") {
            window.location.href = url;
          } else {
            navigate(url);
          }
        })
        .catch((error) => console.error("Lỗi khi lưu từ khóa tìm kiếm:", error));
    }
    else if (searchType === "REWARD") {
      const url = `/redeem-reward?page=1&size=12&context=${searchKeyword}`;
      saveSearchKeyword(searchKeyword)
        .then(() => {
          if (location.pathname === "/redeem-reward") {
            navigate(`/redeem-reward?page=1&size=12&context=${searchKeyword}`)
          } else {
            navigate(url);
          }
        })
        .catch((error) => console.error("Lỗi khi lưu từ khóa tìm kiếm:", error));
    }
  };

  const handleSelectBook = (book: { bookId: number }) => {
    navigate(`/details/${book.bookId}`);
    saveSearchKeyword(searchKeyword);
    setVisible(false);
  }
  const handleSelectReward = (reward: { rewardId: number }) => {
    navigate(`/redeem-reward/${reward.rewardId}`);
    saveSearchKeyword(searchKeyword);
    setVisible(false);
  };
  const getSearchHistoryFromServer = async () => {
    try {
      setIsWatingKeyword(true);
      const data = await getSearchHistory();
      setHistory(data.result || []);
      setIsWatingKeyword(false);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };
  const renderContent = () => (
    <div
      style={{
        width: "400px",
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      {/* Lịch sử tìm kiếm */}
      {isWatingKeyword === false && history.length > 0 && (
        <div className="border-b border-gray-200 pb-2 mb-3">
          <div className="font-semibold text-gray-600 mb-2">Lịch sử tìm kiếm</div>

          <div style={{ display: 'flex', flexDirection: 'row', rowGap: '8px' }}>
            {history.map((item) => (
              <div
                style={{ display: 'flex' }}
                key={item.keyword}
                className="group flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setSearchKeyword(item.keyword)}
              >
                <span>{item.keyword}</span>

                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await deleteSearchHistory(item.keyword);
                      const updated = await getSearchHistory();
                      setHistory(updated.result || []);
                    } catch (err) {
                      console.error("Lỗi khi xóa keyword:", err);
                    }
                  }}
                  className="ml-1 text-gray-400 hover:text-red-500 opacity-80 hover:opacity-100 transition rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Kết quả tìm kiếm */}
      <div>
        <div className="font-semibold text-gray-600 mb-1">Kết quả gợi ý</div>
        {isLoading ? (
          <div className="text-gray-400 italic px-2">Đang tải...</div>
        ) : searchResults.length > 0 ? (
          searchType === "BOOK" ? (
            // Render kết quả sách
            searchResults.map((book) => (
              <div
                key={book.bookId}
                className="cursor-pointer hover:bg-gray-100 px-2 py-2 rounded transition"
                onClick={() => handleSelectBook(book)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "5px",
                  marginBottom: "10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "5px",
                }}
              >
                <img
                  src={book.imageUrl || "/no-image.png"}
                  alt={book.title}
                  style={{
                    width: "100px",
                    height: "90px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <span className="text-gray-800 font-medium truncate" style={{ fontSize: "14px" }}>
                    {book.title}
                  </span>
                  <span className="text-gray-500 text-sm">Tác giả: {book.author}</span>
                </div>
              </div>
            ))
          ) : (
            // Render kết quả redeem reward
            searchResults.map((reward) => {
              const thumbnail =
                reward.images?.find((img) => img.isThumbnail) || reward.images?.[0];
              return (
                <div
                  key={reward.rewardId}
                  className="cursor-pointer hover:bg-gray-100 px-2 py-2 rounded transition"
                  onClick={() => handleSelectReward(reward)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "5px",
                    marginBottom: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "5px",
                  }}
                >

                  <img
                    src={thumbnail?.imageUrl || "/no-image.png"}
                    alt={reward.title}
                    style={{
                      width: "100px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />)

                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <span className="text-gray-800 font-medium truncate" style={{ fontSize: "14px" }}>
                      {reward.title}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {reward.price} điểm
                    </span>
                  </div>
                </div>
              )
            }

            )
          )
        ) : (
          <div className="text-gray-400 italic px-2">Không có kết quả</div>
        )}
      </div>
    </div>
  );




  return (
    <Tippy
      key={visible ? 'open' : 'closed'}
      render={() => (
        <Box
          sx={{
            width: 420,
            maxHeight: 320,
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            p: 1,

          }}
        >
          {renderContent()}
        </Box>
      )}
      placement="bottom-start"
      visible={visible}
      interactive
      theme="light"
      onShow={() => {
        getSearchHistoryFromServer();

      }}
      onShown={() => {

        inputRef.current?.focus();
      }}

      onClickOutside={() => {
        setVisible(false);
        setSearchKeyword("");
        setSearchResults([]);
        setKeyword("");
      }}
    >
      <Box
        sx={{
          position: "relative",
          border: "1px solid #4d4d4d",
          paddingX: "8px",
          paddingY: "2px",
          borderRadius: 2,
          flex: {
            md: 1,
            xs: 0,
          },
          width: {
            md: "auto",
            xs: 190,
          },
          backgroundColor: {
            xs: "white",
          },
          display: "flex",
          alignItems: "center",
        }}


      >
        {/* Icon clear key search */}
        {searchKeyword && !isLoading && (
          <FontAwesomeIcon
            style={{
              position: "absolute",
              top: "50%",
              right: "calc(0.5rem + 70px )",
              transform: "translateY(-50%)",
              color: "rgba(22, 24, 35, 0.34)",
              fontSize: "1rem",
              cursor: "pointer",
              zIndex: 2,
            }}
            onClick={handleClearResult}
            icon={faCircleXmark}
          />
        )}

        <TextField
          ref={inputRef}
          placeholder="One Piece - Đảo Hải Tặc tập 63"
          variant="standard"
          sx={{
            width: 400,
          }}
          slotProps={{
            select: {
              disableUnderline: true,
            },
            input: {
              disableUnderline: true,
            },
          }}
          onClick={() => {
            if (!visible) {
              setVisible(true);
            }

          }}
          onFocus={() => {
            setTimeout(() => {
              if (inputRef.current) {
                const newValue =
                  (inputRef.current as HTMLInputElement).value ?? "";

                if (newValue.trim() !== "" && newValue !== searchKeyword) {
                  setSearchKeyword(newValue);
                }
              }
            }, 100); // Delay nhẹ để đợi autofill xong
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchKeyword(e.target.value);

          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              const inputValue = (e.target as HTMLInputElement).value;
              setSearchKeyword(inputValue.trim());
              handleSearchSubmit();
            }
          }}
          value={searchKeyword ?? ""}
        />
        <Button
          variant="contained"
          size="small"
          disableTouchRipple
          color="error"
          sx={{
            paddingY: "4px",
            display: {
              xs: "none",
              md: "flex",
            },
            alignItems: "center",
          }}
          onClick={handleSearchSubmit}
        >
          <SearchIcon fontSize="small" />
        </Button>
        <Select
          sx={{
            ml: 1,
            "& fieldset": { border: "none" }, // ẩn border của OutlinedInput
          }}
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          size="small"
        >
          <MenuItem value="BOOK">Sách</MenuItem>
          <MenuItem value="REWARD">Phần thưởng</MenuItem>
        </Select>
      </Box>
    </Tippy>
  );
}
