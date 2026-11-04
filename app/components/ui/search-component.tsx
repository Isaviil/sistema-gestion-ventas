import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { anioData, mesesData } from "@/app/services/estaticos";
import InputDate from "./InputDate";
import Button from "./button";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";
import { getLimaDate } from "@/app/utils/dateUtils";
import FormMessage from "./formMessage ";

type FilterValues = {
  filterType: "year_month" | "date_range";
  year: string;
  month: string;
  startDate: string | Date;
  endDate: string | Date;
};

type SearchComponentProps = {
  onFilter: (params: {
    filterType: "year_month" | "date_range";
    year?: string;
    month?: string;
    startDate?: string | Date;
    endDate?: string | Date;
  }) => void;

  initialValues?: Partial<FilterValues>;
  className?: string;
};

export const SearchComponent = ({
  onFilter,
  initialValues,
  className,
}: SearchComponentProps) => {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = (now.getMonth() + 1).toString();

  const methods = useForm<FilterValues>({
    defaultValues: {
      filterType: initialValues?.filterType ?? "year_month",
      year: initialValues?.year ?? currentYear,
      month: initialValues?.month ?? currentMonth,
      startDate: initialValues?.startDate ?? getLimaDate("YYYY-MM-DD", "start"),
      endDate: initialValues?.endDate ?? getLimaDate("YYYY-MM-DD", "end"),
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const onSubmit = (data: FilterValues) => {
    if (data.filterType === "year_month") {
      onFilter({
        filterType: data.filterType,
        year: data.year,
        month: data.month,
      });
    } else {
      onFilter({
        filterType: data.filterType,
        startDate: data.startDate,
        endDate: data.endDate,
      });
    }
  };

  useEffect(() => {
    const currentValues = getValues();
    onSubmit(currentValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterType = useWatch({
    control: methods.control,
    name: "filterType",
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className={`${className} bg-[var(--color-background-secondary)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg shadow-sm space-y-2`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tipo de Búsqueda */}
          <div className="flex items-center space-x-6">
            <span className="text-xs font-semibold text-[var(--color-regular-text)] opacity-80 select-none">
              Tipo de Búsqueda
            </span>
            <RadioGroup
              className="flex items-center space-x-6"
              value={filterType}
              onValueChange={(value) =>
                setValue("filterType", value as "year_month" | "date_range")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="year_month"
                  id="year_month"
                  className="border-2 border-gray-400 dark:border-gray-500 text-blue-600 dark:text-blue-400 data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-blue-400"
                />
                <Label
                  htmlFor="year_month"
                  className="text-xs cursor-pointer font-medium flex items-center mb-0"
                >
                  Por Año/Mes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="date_range"
                  id="date_range"
                  className="border-2 border-gray-400 dark:border-gray-500 text-blue-600 dark:text-blue-400 data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-blue-400"
                />
                <Label
                  htmlFor="date_range"
                  className="text-xs cursor-pointer font-medium flex items-center mb-0"
                >
                  Por Rango de Fechas
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filtro fecha  */}
          <div className="flex items-center gap-3 flex-1">
            {filterType === "year_month" ? (
              <div className="flex items-center gap-3 w-full">
                {/* Año */}
                <div className="w-1/2">
                  <Controller
                    control={methods.control}
                    name="year"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full h-9 text-xs" id="year">
                          <SelectValue placeholder="Seleccione año" />
                        </SelectTrigger>
                        <SelectContent>
                          {anioData.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Mes */}
                <div className="w-1/2 relative">
                  <Controller
                    control={methods.control}
                    name="month"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="w-full h-9 text-xs"
                          id="month"
                        >
                          <SelectValue placeholder="Seleccione mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {mesesData.map((month) => (
                            <SelectItem
                              key={month.id}
                              value={month.id.toString()}
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.month && (
                    <FormMessage
                      type="error"
                      size="xs"
                      className="absolute -bottom-4 left-0"
                    >
                      {errors.month.message}
                    </FormMessage>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                {/* Fecha inicio */}
                <div className="w-1/2 relative">
                  <InputDate
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className="w-full h-9 text-xs overflow-hidden !bg-transparent !text-[var(--color-regular-text)] !border-[var(--color-border)]"
                  />
                  {errors.startDate && (
                    <FormMessage
                      type="error"
                      size="xs"
                      className="absolute -bottom-4 left-0"
                    >
                      {errors.startDate.message}
                    </FormMessage>
                  )}
                </div>

                {/* Fecha fin */}
                <div className="w-1/2 relative">
                  <InputDate
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className="w-full h-9 text-xs overflow-hidden !bg-transparent !text-[var(--color-regular-text)] !border-[var(--color-border)]"
                  />
                  {errors.endDate && (
                    <FormMessage
                      type="error"
                      size="xs"
                      className="absolute -bottom-4 left-0"
                    >
                      {errors.endDate.message}
                    </FormMessage>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Buscar */}
          <div>
            <Button type="submit" size="sm" className="h-9 px-5">
              Buscar
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
