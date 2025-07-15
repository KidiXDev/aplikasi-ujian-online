import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { List, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { EntriesSelector } from '@/components/ui/entries-selector';

<<<<<<< HEAD
import { route } from 'ziggy-js';

const breadcrumbs = [{ title: 'Event', href: '/master-data/event' }];

interface EventType {
  id_event: number;
  nama_event: string;
  status: number;
}

export default function EventManager() {
  const { events } = usePage().props as { events?: EventType[] };
  const safeEvents = events ?? [];

=======
interface PageProps {
  [key: string]: unknown; 
}

interface EventType {
  id_event: number;
  nama_event: string;
  status: number;
}

interface EventsData {
  data: EventType[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface EventsPageProps extends PageProps {
  events: EventsData;
}

const breadcrumbs = [{ title: 'Event', href: '/master-data/event' }];

export default function EventManager() {
  const { props, url } = usePage<EventsPageProps>();
  const events = props.events ?? {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };
  const data = events.data;

  const params = new URLSearchParams(url.split('?')[1] || '');

>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Event" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <ContentTitle
<<<<<<< HEAD
          title="Data Event"
=======
          title="Paket Soal"
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
          showButton
          onButtonClick={() => router.visit(route('master-data.event.create'))}
        />
        <div className="mt-4 flex items-center justify-between">
<<<<<<< HEAD
          <EntriesSelector currentValue={10} options={[10, 25, 50]} routeName="#" />
          <SearchInputMenu defaultValue={''} routeName="#" />
        </div>
        <EventTable data={safeEvents} />
=======
          <EntriesSelector
            currentValue={events.per_page}
            options={[10, 25, 50]}
            routeName="master-data.event.getEvent"
            paramName="pages"
            routeParams={{ search: params.get('search') || '' }}
          />
          <SearchInputMenu
            defaultValue={params.get('search') || ''}
            routeName="master-data.event.getEvent"
            paramName="search"
            routeParams={{ pages: params.get('pages') || events.per_page.toString() }}
          />
        </div>
        <EventTable data={data} events={events} queryParams={params} />
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
      </div>
    </AppLayout>
  );
}

<<<<<<< HEAD
function EventTable({ data }: { data: EventType[] }) {
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [eventData, setEventData] = useState<EventType[]>(data);
=======
function EventTable({
  data,
  events,
  queryParams,
}: {
  data: EventType[];
  events: EventsData;
  queryParams: URLSearchParams;
}) {
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882

  const handleDelete = (id: number) => {
    setTargetId(id);
    setOpen(true);
  };

  const confirmDelete = () => {
<<<<<<< HEAD
    if (targetId === null) return;

    router.delete(`/master-data/event/${targetId}`, {
      onSuccess: () => {
        toast.success(`Event dengan ID ${targetId} berhasil dihapus`);
        setEventData(prev => prev.filter(e => e.id_event !== targetId));
        setOpen(false);
        setTargetId(null);
=======
    if (!targetId) return;
    router.delete(route('master-data.event.destroy', targetId), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Event berhasil dihapus');
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
      },
      onError: () => {
        toast.error('Gagal menghapus event');
      },
    });
<<<<<<< HEAD
=======
    setOpen(false);
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
  };

  const columns = [
    {
      label: 'ID',
      className: 'text-center w-[100px]',
<<<<<<< HEAD
      render: (event: EventType) => <div className="text-center font-medium">{event.id_event}</div>,
=======
      render: (event: EventType) => (
        <div className="text-center font-medium">{event.id_event}</div>
      ),
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
    },
    {
      label: 'Nama Event',
      className: 'text-left w-[400px]',
      render: (event: EventType) => <div>{event.nama_event}</div>,
    },
    {
      label: 'Status',
      className: 'text-center w-[200px]',
      render: (event: EventType) => (
        <div className="flex justify-center">
          <span
<<<<<<< HEAD
            className={`px-3 py-1 rounded text-white font-semibold text-sm ${
              event.status === 1 ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {event.status === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      label: 'Action',
      className: 'text-center w-[150px]',
      render: (event: EventType) => (
        <div className="flex justify-center gap-2">
          <CButtonIcon
            icon={List}
            className="bg-yellow-500"
            onClick={() => router.visit(`/master-data/event/${event.id_event}/detail`)}
          />
          <CButtonIcon
            icon={Pencil}
            onClick={() => router.visit(route('master-data.event.edit', event.id_event))}
          />
          <CButtonIcon
            icon={Trash2}
            type="danger"
            onClick={() => handleDelete(event.id_event)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <CustomTable columns={columns} data={eventData} />
      <PaginationWrapper
        currentPage={1}
        lastPage={1}
        perPage={10}
        total={eventData.length}
        onNavigate={() => {}}
      />
=======
            className={`px-3 py-1 rounded text-white font-semibold text-sm min-w-[100px] text-center ${
              event.status === 1 ? 'bg-green-600' : 'bg-red-600'

            }`}
          >
            {event.status === 1 ? 'Aktif' : 'Tidak Aktif'}
          </span>
        </div>
      ),
    },
    {
      label: 'Mulai Event',
      className: 'text-center w-[200px]',
      render: (event: EventType & { mulai_event?: string }) => (
        <div className="text-center">
          {event.mulai_event
            ? new Date(event.mulai_event).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '-'}
        </div>
      ),
    },
    {
      label: 'Akhir Event',
      className: 'text-center w-[200px]',
      render: (event: EventType & { akhir_event?: string }) => (
        <div className="text-center">
          {event.akhir_event
            ? new Date(event.akhir_event).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '-'}
        </div>
      ),
    },
    {
      label: 'Action',
      className: 'text-center w-[150px]',
      render: (event: EventType) => (
        <div className="flex justify-center gap-2">
          <CButtonIcon
            icon={List}
            className="bg-yellow-500"
            onClick={() => router.visit(`/master-data/paket-soal/${event.id_event}`)}
          />
          <CButtonIcon
            icon={Pencil}
            onClick={() =>
              router.visit(route('master-data.event.edit', event.id_event))
            }
          />
          <CButtonIcon
            icon={Trash2}
            type="danger"
            onClick={() => handleDelete(event.id_event)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <CustomTable columns={columns} data={data} />
      <PaginationWrapper
        currentPage={events.current_page}
        lastPage={events.last_page}
        perPage={events.per_page}
        total={events.total}
        onNavigate={(page) => {
          router.visit(
            route('master-data.event.getEvent', {
              pages: queryParams.get('pages') || events.per_page,
              search: queryParams.get('search') || '',
              page,
            }),
            { preserveScroll: true }
          );
        }}
      />
      {/* Dialog konfirmasi hapus */}
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
      <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
    </>
  );
}
