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

interface DiscountSelectorProps {
  value: string
  onChange: (valueChange: string) => void
}

export default function DiscountSelector({ value, onChange }: DiscountSelectorProps) {
  const selectTargetDiscount = value || ""
  const listTargetDiscount = ["ORDER", "BOOK", "REDEEM"]
  const toggleDiscountTarget = (selectedTargetDiscount: string) => {
    const isSelected = selectTargetDiscount === selectedTargetDiscount

    if (isSelected) {
      // Bỏ chọn discount target
      onChange("")
    } else {
      // Chọn discount target
      onChange(selectedTargetDiscount)
    }
  }



  function renderDiscountTarget(
    listTargetDiscount: string[],
  ): JSX.Element[] {
    return listTargetDiscount.map((target) => {
      const isSelected = selectTargetDiscount === target

      return (
        <CommandItem
          key={target}
          value={target}
          onSelect={() => toggleDiscountTarget(target)}
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
          {selectTargetDiscount === "" ? (
            <div className='flex w-full justify-center'>
              <span className='text-sm'>Chưa chọn</span>
            </div>
          ) : (

            <Badge variant='default'>
              {selectTargetDiscount}
            </Badge>

          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <Command>

          <CommandList>

            <CommandGroup heading='Danh mục'>
              {renderDiscountTarget(listTargetDiscount)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
