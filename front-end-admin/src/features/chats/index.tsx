import { useState, useEffect, useRef, useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconMessages,
  IconPaperclip,
  IconPhone,
  IconPhotoPlus,
  IconPlus,
  IconSearch,
  IconSend,
  IconVideo,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NewChat } from './components/new-chat'
import { MessageUserResponse } from "@/hooks/useAdminConversation";
// Fake Data
import { conversations } from './data/convo.json'
import { useAdminInbox } from "@/hooks/useAdminInbox";
import { useAdminConversation } from "@/hooks/useAdminConversation";
import { useAdminChatSocket } from "@/hooks/useWebsocket";

export default function Chats() {
  const [search, setSearch] = useState('')
  const [activeConversationId, setActiveConversationId] = useState<number>()
  const [selectedInboxItem, setSelectedInboxItem] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationStatus, setConversationStatus] = useState<string>("")
  const [createConversationDialogOpened, setCreateConversationDialog] =
    useState(false)
  const { inbox, loading, refreshInbox, joinAConversation, leaveAConversation } = useAdminInbox()
  const {
    messages,
    setMessages,
    loading: conversationLoading,
    conversation
  } = useAdminConversation(activeConversationId)
  const sortMessage = useMemo(() => {
    // Tạo bản sao bằng [...messages] trước khi sort để không làm hỏng state gốc
    return [...messages].sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime())
  }, [messages])
  const { sendAdminMessage } = useAdminChatSocket(
    activeConversationId,
    (msg: MessageUserResponse) => {
      setMessages(prev => [...prev, msg])
    },
    () => {
      refreshInbox()
    }
  )
  // Filtered data based on the search query
  const filteredChatList = inbox.filter(item =>
    item.username.toLowerCase().includes(search.toLowerCase())
  )
  const [canChat, setCanChat] = useState(false)
  // Mặc định reset về false trước.
  // Sau đó kiểm tra nếu server báo là "HAS_ADMIN" thì mới set thành true.
  useEffect(() => {
    if (selectedInboxItem?.status === 'HAS_ADMIN') {
      setCanChat(true)
    } else {
      setCanChat(false)
    }
  }, [selectedInboxItem]) // Chạy lại mỗi khi chọn inbox item mới hoặc list được refresh
  const users = conversations.map(({ messages, ...user }) => user)
  // Xu ly gui tin nhan 
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault(); // Chặn reload trang

    const content = inputRef.current?.value || "";
    if (!content.trim()) return;

    sendAdminMessage(content);

    if (inputRef.current) {
      inputRef.current.value = "";
      // Quan trọng: Focus lại vào input sau khi gửi để không bị mất trỏ chuột
      inputRef.current.focus();
    }
  }
  // Thêm useEffect để auto scroll khi sortMessage thay đổi
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortMessage]);
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <IconMessages size={20} />
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='rounded-lg'
                >
                  <IconEdit size={24} className='stroke-muted-foreground' />
                </Button>
              </div>

              <label className='border-input focus-within:ring-ring flex h-12 w-full items-center space-x-0 rounded-md border pl-2 focus-within:ring-1 focus-within:outline-hidden'>
                <IconSearch size={15} className='mr-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search chat...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <ScrollArea className='-mx-3 h-full p-3'>
              {filteredChatList.map((item) => (
                <Fragment key={item.conversationId}>
                  <button
                    className={cn(
                      "hover:bg-secondary/75 -mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm",
                      selectedInboxItem?.conversationId === item.conversationId && "sm:bg-muted"
                    )}
                    onClick={() => {
                      setSelectedInboxItem(item)
                      setActiveConversationId(item.conversationId)

                    }}
                  >
                    <div className="flex gap-2">
                      {item.status === "WAITING_ADMIN" ? (
                        <Button
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation(); // Chặn click lan ra ngoài

                            try {
                              // 1. Gọi API và hứng kết quả trả về
                              // Giả định hook joinAConversation trả về đúng DTO: { code, status, message }
                              const response = (await joinAConversation(item.userId)).result;

                              // 2. Kiểm tra điều kiện SUCCESS từ DTO
                              if (response && response.status === "Success") {

                                // 3. Nếu đang mở cuộc hội thoại này -> Cập nhật ngay state local để mở khóa Input
                                if (selectedInboxItem?.conversationId === item.conversationId) {
                                  setSelectedInboxItem((prev: any) => ({
                                    ...prev,
                                    status: "HAS_ADMIN" // Đổi trạng thái để khớp logic mở khóa
                                  }));
                                }
                                setCanChat(true)

                                // 4. Refresh lại list tổng để đồng bộ dữ liệu
                                refreshInbox();

                              } else {
                                // Xử lý lỗi (VD: hiện thông báo lỗi từ message API trả về)
                                alert(response?.message || "Không thể tham gia cuộc hội thoại");
                              }
                            } catch (error) {
                              console.error("Lỗi khi join:", error);
                            }
                          }}
                        >
                          Tham gia chat
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async (e) => {
                            e.stopPropagation();

                            try {
                              // Gọi API rời cuộc trò chuyện
                              const response = (await leaveAConversation(activeConversationId!)).result;

                              // Kiểm tra status SUCCESS
                              if (response && response.status === "Fail") {

                                // Nếu đang mở chat này -> Cập nhật state để KHÓA Input lại
                                if (selectedInboxItem?.conversationId === item.conversationId) {
                                  setSelectedInboxItem((prev: any) => ({
                                    ...prev,
                                    status: "BOT" // Hoặc trạng thái nào đó không phải HAS_ADMIN
                                  }));
                                }
                                setCanChat(false)
                                refreshInbox();

                              } else {
                                alert(response?.message || "Không thể rời cuộc hội thoại");
                              }
                            } catch (error) {
                              console.error("Lỗi khi leave:", error);
                            }
                          }}
                        >
                          Rời chat
                        </Button>
                      )}
                      <Avatar>
                        <AvatarFallback>{item.username[0]}</AvatarFallback>
                      </Avatar>

                      <div style={{ maxWidth: "300px", maxHeight: "60px" }}>
                        <span className="font-medium">{item.username}</span>
                        <div className="text-muted-foreground text-xs line-clamp-1 break-all">
                          {item.lastMessage || ""}
                        </div>
                      </div>
                    </div>
                  </button>
                  <Separator className="my-1" />
                </Fragment>
              ))}

            </ScrollArea>
          </div>

          {/* Right Side */}
          {selectedInboxItem ? (
            <div
              className={cn(
                'bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex',
                'left-0 flex'
              )}
            >
              {/* Top Part */}
              <div className='bg-secondary mb-1 flex flex-none justify-between rounded-t-md p-4 shadow-lg'>
                {/* Left */}
                <div className='flex gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ml-2 h-full sm:hidden'
                  // onClick={() => {
                  //   if (!messageInput.trim()) return
                  //   sendAdminMessage(messageInput)
                  //   setMessageInput("")
                  // }}
                  >
                    <IconArrowLeft />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    {/* <Avatar className='size-9 lg:size-11'>
                      <AvatarImage
                        src={selectedUser.profile}
                        alt={selectedUser.username}
                      />
                      <AvatarFallback>{selectedUser.username}</AvatarFallback>
                    </Avatar> */}
                    <div>
                      <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                        {conversation?.userName}
                      </span>
                      {/* <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-xs text-nowrap text-ellipsis lg:max-w-none lg:text-sm'>
                        {selectedUser.title}
                      </span> */}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                  >
                    <IconVideo size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                  >
                    <IconPhone size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
                  >
                    <IconDotsVertical className='stroke-muted-foreground sm:size-5' />
                  </Button>
                </div>
              </div>

              {/* Conversation */}
              <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
                <div className='flex size-full flex-1'>
                  <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                    <div
                    ref={scrollRef}
                     className='chat-flex flex h-40 w-full grow flex-col justify-start gap-4 overflow-y-auto py-2 pr-4 pb-4'>
                      {sortMessage.map((msg) => {
                        // Hiển thị nằm giữa, chữ nhỏ, in nghiêng
                        if (msg.sender === "SYSTEM") {
                          return (
                            <div key={msg.id} className="flex w-full justify-center my-2">
                              <span className="text-xs text-muted-foreground italic bg-secondary/50 px-3 py-1 rounded-full text-center">
                                {msg.message}
                              </span>
                            </div>
                          );
                        }
                        const isUser = msg.sender === "USER"
                        const isAdmin = msg.sender === "ADMIN"
                        const isBot = msg.sender === "BOT"

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex w-full",
                              isUser ? "justify-start" : "justify-end"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-72 px-3 py-2 rounded-lg shadow-md text-sm",
                                isUser && "bg-secondary rounded-bl-none",
                                isAdmin &&
                                "bg-primary text-primary-foreground rounded-br-none",
                                isBot &&
                                "bg-emerald-500 text-white rounded-br-none"
                              )}
                            >
                              {/* Sender label */}
                              <div className="mb-1 text-xs font-semibold opacity-80">
                                {isUser && "User"}
                                {isAdmin && "Admin"}
                                {isBot && "Bot"}
                              </div>

                              {/* Message content */}
                              <div>{msg.message}</div>

                              {/* Time */}
                              <div
                                className={cn(
                                  "mt-1 text-xs opacity-70",
                                  isUser ? "text-left" : "text-right"
                                )}
                              >
                                {format(new Date(msg.createdDate), "HH:mm")}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <form
                  onSubmit={handleSendMessage}
                  className='flex w-full flex-none gap-2'>
                  <div className='border-input focus-within:ring-ring flex flex-1 items-center gap-2 rounded-md border px-2 py-1 focus-within:ring-1 focus-within:outline-hidden lg:gap-4'>
                    <div className='space-x-1'>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='h-8 rounded-md'
                      >
                        <IconPlus
                          size={20}
                          className='stroke-muted-foreground'
                        />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <IconPhotoPlus
                          size={20}
                          className='stroke-muted-foreground'
                        />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <IconPaperclip
                          size={20}
                          className='stroke-muted-foreground'
                        />
                      </Button>
                    </div>
                    <label className='flex-1'>
                      <span className='sr-only'>Chat Text Box</span>
                      <input
                        autoComplete="off"
                        ref={inputRef}
                        disabled={!canChat}
                        placeholder={canChat ? "Type your messages..." : "Bạn cần tham gia để chat"}
                        className="h-8 w-full bg-inherit focus-visible:outline-hidden"
                      />
                    </label>
                    {/* Nút gửi tin nhắn */}
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                    >
                      <IconSend size={20} />
                    </Button>
                  </div>
                  <Button className='h-full sm:hidden' type="submit">
                    <IconSend size={18} /> Send
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex'
              )}
            >
              <div className='flex flex-col items-center space-y-6'>
                <div className='border-border flex size-16 items-center justify-center rounded-full border-2'>
                  <IconMessages className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Your messages</h1>
                  <p className='text-muted-foreground text-sm'>
                    Send a message to start a chat.
                  </p>
                </div>
                <Button
                  className='bg-blue-500 px-6 text-white hover:bg-blue-600'
                  onClick={() => setCreateConversationDialog(true)}
                >
                  Send message
                </Button>
              </div>
            </div>
          )}
        </section>
        <NewChat
          users={users}
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
        />
      </Main>
    </>
  )
}
