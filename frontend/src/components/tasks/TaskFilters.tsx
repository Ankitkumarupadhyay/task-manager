import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, SORT_OPTIONS } from '@/utils/constants';
import { useUsers } from '@/hooks/useUsers';
import { useEffect, useState } from 'react';

export function TaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: usersData } = useUsers({ limit: 100 });

  const [localSearch, setLocalSearch] = useState(searchParams.get('search') ?? '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (localSearch) {
        params.set('search', localSearch);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearAll = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const hasFilters = ['status', 'priority', 'assignee', 'search', 'sort_by'].some(
    (k) => searchParams.has(k)
  );

  const sortOrder = searchParams.get('sort_order') || 'desc';
  const userOptions = (usersData?.items ?? []).map((u) => ({ value: String(u.id), label: u.name }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-52">
          <Input
            placeholder="Search tasks..."
            leftIcon={<Search className="h-4 w-4" />}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            id="task-search"
          />
        </div>

        {/* Status filter */}
        <div className="w-40">
          <Select
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            value={searchParams.get('status') ?? ''}
            onChange={(e) => updateParam('status', e.target.value)}
            id="filter-status"
          />
        </div>

        {/* Priority filter */}
        <div className="w-40">
          <Select
            options={PRIORITY_OPTIONS}
            placeholder="All Priorities"
            value={searchParams.get('priority') ?? ''}
            onChange={(e) => updateParam('priority', e.target.value)}
            id="filter-priority"
          />
        </div>

        {/* Assignee filter */}
        <div className="w-44">
          <Select
            options={userOptions}
            placeholder="All Assignees"
            value={searchParams.get('assignee') ?? ''}
            onChange={(e) => updateParam('assignee', e.target.value)}
            id="filter-assignee"
          />
        </div>

        {/* Sort by */}
        <div className="w-44">
          <Select
            options={SORT_OPTIONS}
            value={searchParams.get('sort_by') ?? 'created_at'}
            onChange={(e) => updateParam('sort_by', e.target.value)}
            id="sort-by"
          />
        </div>

        {/* Sort order toggle */}
        <Button
          variant="outline"
          size="md"
          onClick={() => updateParam('sort_order', sortOrder === 'asc' ? 'desc' : 'asc')}
          leftIcon={sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </Button>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="md" onClick={clearAll} leftIcon={<X className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
