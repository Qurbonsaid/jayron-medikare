import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { FileText, Printer, Send } from 'lucide-react'

interface Test {
  id: string
  name: string
  code: string
  selected: boolean
}

const LabOrder = () => {
  const [priority, setPriority] = useState('normal')
  const [barcode, setBarcode] = useState('')
  const [tests, setTests] = useState<Test[]>([
    { id: '1', name: 'Умумий қон таҳлили', code: 'CBC', selected: false },
    { id: '2', name: 'Биохимик қон таҳлили', code: 'BIO', selected: false },
    { id: '3', name: 'Қанд миқдори', code: 'GLU', selected: false },
    { id: '4', name: 'Умумий сийдик таҳлили', code: 'UA', selected: false },
    { id: '5', name: 'Липид профили', code: 'LIP', selected: false },
    { id: '6', name: 'Жигар функцияси', code: 'LFT', selected: false },
    { id: '7', name: 'Буйрак функцияси', code: 'RFT', selected: false },
    { id: '8', name: 'Тиреоид гормонлари', code: 'THY', selected: false },
  ])

  const toggleTest = (id: string) => {
    setTests(
      tests.map(test =>
        test.id === id ? { ...test, selected: !test.selected } : test
      )
    )
  }

  const generateBarcode = () => {
    const code = `LAB-${Date.now().toString().slice(-8)}`
    setBarcode(code)
  }

  const selectedTests = tests.filter(t => t.selected)

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
          <div>
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2'>
              Таҳлил Буюртмаси
            </h1>
            <p className='text-xs sm:text-sm md:text-base text-muted-foreground mt-1'>
              Янги лаборатория буюртмаси яратиш
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' className='w-full sm:w-auto'>
              <Printer className='mr-2 h-4 w-4' />
              Чоп Этиш
            </Button>
            <Button className='w-full sm:w-auto'>
              <Send className='mr-2 h-4 w-4' />
              Юбориш
            </Button>
          </div>
        </div>

        {/* Patient Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className='text-xl md:text-2xl font-bold'>Бемор Маълумоти</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label className='font-normal'>Бемор Исми</Label>
                <p className="font-medium">Каримов Жавлон Алишерович</p>
              </div>
              <div>
                <Label className='font-normal'>Туғилган Сана</Label>
                <p className="font-medium">20.08.1978 (46 йош)</p>
              </div>
              <div>
                <Label className='font-normal'>ID</Label>
                <p className="font-medium">#PAT-2025-001</p>
              </div>
              <div>
                <Label className='font-normal'>Diagnostika</Label>
                <p className="font-medium">Yurak kasalligi</p>
              </div>
              <div>
                <Label className='font-normal'>Телефон</Label>
                <p className="font-medium">+998 91 234 56 78</p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Test Selection */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-xl md:text-2xl font-bold'>Таҳлил Турларини Танланг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {tests.map(test => (
                <div
                  key={test.id}
                  className='flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors'
                >
                  <Checkbox
                    id={test.id}
                    checked={test.selected}
                    onCheckedChange={() => toggleTest(test.id)}
                  />
                  <Label
                    htmlFor={test.id}
                    className='flex-1 cursor-pointer text-sm'
                  >
                    {test.name}
                    <Badge variant='secondary' className='ml-2 text-xs'>
                      {test.code}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>

            {selectedTests.length > 0 && (
              <div className='mt-4 p-3 bg-muted rounded-lg'>
                <p className='font-semibold text-sm'>
                  Танланган таҳлиллар: {selectedTests.length}
                </p>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {selectedTests.map(test => (
                    <Badge key={test.id} variant='default' className='text-xs'>
                      {test.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-xl md:text-2xl font-bold'>Устувор Даража</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={priority} onValueChange={setPriority}>
              {[
                { value: 'normal', label: 'Оддий', desc: 'Натижа 24-48 соат ичида', badge: 'Оддий', badgeClass: 'bg-gray-200 text-black' },
                { value: 'urgent', label: 'Шошилинч', desc: 'Натижа 6-12 соат ичида', badge: 'Шошилинч', badgeClass: 'bg-orange-500 text-white' },
                { value: 'stat', label: 'Жуда Шошилинч', desc: 'Натижа 1-2 соат ичида', badge: 'Жуда Шошилинч', badgeClass: 'bg-red-600 text-white' },
              ].map(item => (
                <div key={item.value} className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border mb-3'>
                  <div className='flex items-center gap-3'>
                    <RadioGroupItem value={item.value} id={item.value} />
                    <Label htmlFor={item.value} className='cursor-pointer text-sm'>
                      <span className='font-semibold'>{item.label}</span>
                      <p className='text-xs text-muted-foreground'>{item.desc}</p>
                    </Label>
                  </div>
                  <Badge className={`mt-2 sm:mt-0 ${item.badgeClass}`}>{item.badge}</Badge>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>


        {/* Barcode */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-xl md:text-2xl font-bold'>Намуна Штрих-Коди</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col sm:flex-row sm:items-end gap-4'>
              <div className='flex-1'>
                <Label>Штрих-Код</Label>
                <div className='mt-2 p-4 bg-muted rounded-lg text-center'>
                  {barcode ? (
                    <div>
                      <div className='text-xl font-mono font-bold mb-2'>{barcode}</div>
                      <div className='h-12 bg-card flex items-center justify-center'>
                        <div className='text-3xl font-mono tracking-widest'>||||||||||||</div>
                      </div>
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>Штрих-код яратилмаган</p>
                  )}
                </div>
              </div>
              <Button onClick={generateBarcode} className='w-full sm:w-auto'>
                <FileText className='mr-2 h-4 w-4' />
                Штрих-Код Яратиш
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Indication */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-xl md:text-2xl font-bold'>Клиник Кўрсатма</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Таҳлил сабаби ва клиник ахвол</Label>
            <Textarea rows={5} className='mt-2 w-full' placeholder='Мисол: Беморда қондаги қанд миқдори ошган...' />
          </CardContent>
        </Card>

        {/* Lab Assignment */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-xl md:text-2xl font-bold'>Лаборант Тайинлаш</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='p-4 bg-muted rounded-lg'>
              <p className='text-muted-foreground mb-2'>Автоматик тайинланган:</p>
              <p className='font-semibold'>Лаборант: Исмоилова Нигора Фарходовна</p>
              <p className='text-muted-foreground mt-1'>Бўш лаборант (Навбатдаги: 3 таҳлил)</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row justify-end gap-3 mt-6'>
          <Button variant='outline' className='w-full sm:w-auto'>Бекор Қилиш</Button>
          <Button variant='secondary' className='w-full sm:w-auto'>Сақлаш</Button>
          <Button className='w-full sm:w-auto'>Тасдиқлаш ва Юбориш</Button>
        </div>
      </div>
    </div>
  )
}

export default LabOrder

