import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Button } from '@/components/common';
import type { NotesFilter } from '@/types';

interface NotesFilterProps {
  onFilterChange: (filter: NotesFilter) => void;
  isLoading?: boolean;
}

export function NotesFilterPanel({ onFilterChange, isLoading }: NotesFilterProps) {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const filter: NotesFilter = {};
    if (search.trim()) filter.q = search.trim();
    if (tag.trim()) filter.tag = tag.trim();
    if (fromDate) filter.from = fromDate;
    if (toDate) filter.to = toDate;
    onFilterChange(filter);
  };

  const clearFilters = () => {
    setSearch('');
    setTag('');
    setFromDate('');
    setToDate('');
    onFilterChange({});
  };

  const hasActiveFilters = search || tag || fromDate || toDate;
  const activeFilterCount = [search, tag, fromDate, toDate].filter(Boolean).length;

  return (
    <Paper variant="outlined" sx={{ p: 2 }} className="snoremd-notes-filter-panel">
      <Box component="form" onSubmit={handleSubmit} className="snoremd-notes-filter-form">
        {/* Search Bar - Always visible */}
        <Box className="snoremd-notes-filter-search-row" sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            className="snoremd-notes-search-input"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" disabled={isLoading} className="snoremd-notes-search-btn">
            Search
          </Button>
          <Badge badgeContent={activeFilterCount} color="primary" invisible={activeFilterCount === 0} className="snoremd-notes-filter-badge">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              startIcon={<FilterListIcon />}
              className="snoremd-notes-filter-toggle-btn"
            >
              Filters
            </Button>
          </Badge>
        </Box>

        {/* Expanded Filters */}
        <Collapse in={isExpanded} className="snoremd-notes-filter-expanded">
          <Box className="snoremd-notes-filter-advanced" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} className="snoremd-notes-filter-grid">
              <Grid item xs={12} md={4}>
                <TextField
                  label="Filter by Tag"
                  placeholder="e.g., urgent, follow-up"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  fullWidth
                  size="small"
                  className="snoremd-notes-filter-tag-input"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="From Date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  fullWidth
                  size="small"
                  className="snoremd-notes-filter-from-date"
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="To Date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  fullWidth
                  size="small"
                  className="snoremd-notes-filter-to-date"
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>
            </Grid>

            <Box className="snoremd-notes-filter-actions" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
              {hasActiveFilters && (
                <Button type="button" variant="ghost" onClick={clearFilters} className="snoremd-notes-clear-filters-btn">
                  Clear Filters
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="snoremd-notes-apply-filters-btn">
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}
