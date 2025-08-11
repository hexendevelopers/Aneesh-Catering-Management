'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import { orderService, type OrderData } from '@/services/orderService';
import { toast } from 'sonner';

export default function CreateOrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  // Create form schema with translated validation messages
  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    receiptNo: z.string().min(1, t('validation.receiptRequired')),
    date: z.string().min(1, t('validation.dateRequired')),
    time: z.string().min(1, t('validation.timeRequired')),
    phoneNumber: z.string().min(1, t('validation.phoneRequired')),
    orderDetails: z.string().min(1, t('validation.orderDetailsRequired')),
    totalPayment: z.string().min(1, t('validation.totalPaymentRequired')),
    advancePayment: z.string().min(1, t('validation.advancePaymentRequired')),
    location: z.string().min(1, t('validation.locationRequired')),
    paymentType: z.enum(['cash', 'atm', 'transfer'], {
      required_error: t('validation.paymentTypeRequired')
    }),
    deliveryType: z.string().min(1, t('validation.deliveryTypeRequired'))
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      receiptNo: '',
      date: new Date().toISOString().split('T')[0], // Auto-fill current date
      time: '',
      phoneNumber: '',
      orderDetails: '',
      totalPayment: '',
      advancePayment: '',
      location: '',
      paymentType: undefined,
      deliveryType: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Prepare order data with automatic cook sharing
      const orderData = {
        ...data,
        sharedToCook: true, // Automatically share with cook
        cookStatus: 'pending' as const,
        status: 'unpaid' as const
      } as OrderData;

      // Save order to Firebase Realtime Database
      const orderId = await orderService.createOrder(orderData);
      
      // eslint-disable-next-line no-console
      console.log('Order created with ID:', orderId);
      
      // Show success message
      toast.success(t('message.orderCreated'), {
        description: `Order ID: ${orderId} - Shared with kitchen`,
        duration: 5000,
      });
      
      // Reset form after successful submission
      form.reset({
        name: '',
        receiptNo: '',
        date: new Date().toISOString().split('T')[0], // Keep current date
        time: '',
        phoneNumber: '',
        orderDetails: '',
        totalPayment: '',
        advancePayment: '',
        location: '',
        paymentType: undefined,
        deliveryType: ''
      });
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating order:', error);
      
      // Show error message
      toast.error(t('message.orderError'), {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-start'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            {t('page.createOrder')}
          </h1>
        </div>

        {/* Main Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('section.orderInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                {/* Customer Information Section */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-medium border-b pb-2'>
                    {t('section.customerInformation')}
                  </h3>
                  <div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2'>
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.customerName')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('field.customerName.placeholder')}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name='phoneNumber'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.phoneNumber')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('field.phoneNumber.placeholder')}
                              type='tel'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location */}
                    <FormField
                      control={form.control}
                      name='location'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                          <FormLabel>
                            {t('field.deliveryLocation')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('field.deliveryLocation.placeholder')}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Order Details Section */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-medium border-b pb-2'>
                    {t('section.orderDetails')}
                  </h3>
                  <div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2'>
                    {/* Receipt No */}
                    <FormField
                      control={form.control}
                      name='receiptNo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.receiptNumber')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('field.receiptNumber.placeholder')}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date */}
                    <FormField
                      control={form.control}
                      name='date'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.date')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type='date' 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Time */}
                    <FormField
                      control={form.control}
                      name='time'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.time')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type='time' 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Type of Delivery */}
                    <FormField
                      control={form.control}
                      name='deliveryType'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.deliveryType')}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('field.deliveryType.placeholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='pickup'>{t('delivery.pickup')}</SelectItem>
                              <SelectItem value='home-delivery'>{t('delivery.homeDelivery')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Order Details Textarea */}
                  <FormField
                    control={form.control}
                    name='orderDetails'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('field.orderDetails')}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('field.orderDetails.placeholder')}
                            className='min-h-[120px] resize-none'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Payment Information Section */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-medium border-b pb-2'>
                    {t('section.paymentInformation')}
                  </h3>
                  <div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2'>
                    {/* Total Payment */}
                    <FormField
                      control={form.control}
                      name='totalPayment'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.totalPayment')} (OMR)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('field.totalPayment.placeholder')}
                              type='number'
                              step='0.001'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Advance Payment */}
                    <FormField
                      control={form.control}
                      name='advancePayment'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('field.advancePayment')} (OMR)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('field.advancePayment.placeholder')}
                              type='number'
                              step='0.001'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Type of Payment */}
                  <FormField
                    control={form.control}
                    name='paymentType'
                    render={({ field }) => (
                      <FormItem className='space-y-3'>
                        <FormLabel>
                          {t('field.paymentType')}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className='flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-8'
                          >
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='cash' id='cash' />
                              <Label htmlFor='cash'>
                                {t('payment.cash')}
                              </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='atm' id='atm' />
                              <Label htmlFor='atm'>
                                {t('payment.atm')}
                              </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='transfer' id='transfer' />
                              <Label htmlFor='transfer'>
                                {t('payment.transfer')}
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Button */}
                <div className='flex justify-start pt-6'>
                  <Button type='submit' disabled={isSubmitting} className='w-full sm:w-auto'>
                    {isSubmitting ? t('button.creating') : t('button.createOrder')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}