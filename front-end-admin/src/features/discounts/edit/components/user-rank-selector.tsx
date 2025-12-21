import { JSX } from 'react'
import { IconCheckbox, IconSquare } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Command,

  CommandGroup,

  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface UserRankSelectorProps {
  value: string
  onChange: (valueChange: string) => void
}

export default function UserRankSelector({ value, onChange }: UserRankSelectorProps) {
  const selectUserRank = value || ""
  const listUserRank = ["Bronze","Silver" ,"Gold", "Platinum","Diamond"]
  const toggleUserRank = (selectedTargetUserRank: string) => {
    const isSelected = selectUserRank === selectedTargetUserRank

    if (isSelected) {
      // Bỏ chọn discount target
      onChange("")
    } else {
      // Chọn discount target
      onChange(selectedTargetUserRank)
    }
  }



  function renderUserRank(
    listTargetUserRank: string[],
  ): JSX.Element[] {
    return listTargetUserRank.map((target) => {
      const isSelected = selectUserRank === target

      return (
        <CommandItem
          key={target}
          value={target}
          onSelect={() => toggleUserRank(target)}
          className='flex items-center justify-between'
        >
          <span>{target}</span>
          {isSelected ? (
            <IconCheckbox className='ml-2 h-4 w-4' />
          ) : (
            <IconSquare className='ml-2 h-4 w-4' />
          )}
        </CommandItem>
      )
    })


  }


  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          id='targetChosen'
          className='flex w-full cursor-pointer flex-wrap gap-2 border-2 border-dashed p-2'
        >
          {selectUserRank === "" ? (
            <div className='flex w-full justify-center'>
              <span className='text-sm'>Chưa chọn</span>
            </div>
          ) : (

            <Badge variant='default'>
              {selectUserRank}
            </Badge>

          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <Command>

          <CommandList>

            <CommandGroup heading='Danh mục'>
              {renderUserRank(listUserRank)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
