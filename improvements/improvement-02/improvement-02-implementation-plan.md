# Focused Implementation Plan: Core Project-Centric Architecture

**Status: PLANNED**  
**Goal: Minimal viable implementation of our core design decisions**

## Overview

This plan implements **only the essential changes** from improvement-02.md to get maximum benefit with minimal risk. We're focusing on the three core improvements that provide the biggest impact:

1. **UUIDs** - Robust entity identification
2. **Index-based prioritization** - Clear execution order
3. **Simplified primitives** - Remove complexity overhead

**What we're NOT doing yet:**

- Advanced MCP features
- Complex parallelization analysis
- Extensive refactoring of existing tools
- Document versioning or advanced features

## Core Principles

- **Ship fast, iterate later**
- **Backward compatibility where possible**
- **No breaking changes to existing data**
- **Focus on agent productivity wins**

## Epic Breakdown (3 Epics Only)

### Epic 1: Core Data Model Simplification

**Goal: Update types.ts with simplified, UUID-based entities**

**Tasks:**

1. Add UUID dependency to package.json
2. Update Project interface (remove type, status, metadata - keep id, title, owner, index)
3. Update Epic interface (add project_id, index, remove description, priority)
4. Update Task interface (add index, dependencies array, remove description, notes)
5. Add Document interface (simple: id, title, content, type, entity_type, entity_id, author)
6. Update ProjectData interface to include documents array

**Acceptance Criteria:**

- All interfaces compile without errors
- Existing data can be migrated without loss
- UUIDs are properly typed as strings

### Epic 2: UUID Generation and Index Management

**Goal: Replace ID generation with UUIDs and add index auto-assignment**

**Tasks:**

1. Add uuid v4 generation utility to TaskManager
2. Update createProject to use UUIDs and auto-assign index
3. Update createEpic to use UUIDs and auto-assign index within project
4. Update createTask to use UUIDs and auto-assign index within epic
5. Add simple reorderEpics function (just update index values)
6. Add simple reorderTasks function (just update index values)

**Acceptance Criteria:**

- All new entities get proper UUIDs
- Indexes are automatically assigned (1, 2, 3...)
- Reordering works without breaking existing functionality

### Epic 3: Basic Document Support

**Goal: Add minimal document creation and attachment**

**Tasks:**

1. Add createDocument method to TaskManager
2. Add getDocumentsByEntity method to TaskManager
3. Add create_document MCP tool
4. Add get_documents MCP tool
5. Update onboard function to include attached documents

**Acceptance Criteria:**

- Can create and attach documents to any entity
- Can retrieve documents for any entity
- Onboarding includes document context

## What We're Explicitly NOT Doing

### ❌ Advanced Features (Save for Later)

- Parallelization analysis algorithms
- Resource conflict detection
- Complex dependency validation
- Advanced MCP protocol features
- Real-time notifications
- Document versioning
- Extensive error handling

### ❌ Major Refactoring (Too Risky)

- Rewriting all existing MCP tools
- Changing existing API signatures
- Complex migration scripts
- Breaking changes to data format

### ❌ Over-Engineering (Premature Optimization)

- Complex branching strategies
- Extensive documentation requirements
- Advanced repository management
- Sophisticated error handling

## Implementation Strategy

### Phase 1: Types and Core Logic (Week 1)

- Epic 1: Update types.ts
- Epic 2: UUID generation and basic index management
- Test with existing data to ensure no breakage

### Phase 2: Document Support (Week 2)

- Epic 3: Basic document creation and attachment
- Simple integration with onboarding
- Manual testing of core workflows

### Phase 3: Validation and Polish (Week 3)

- Test all new functionality
- Ensure backward compatibility
- Document the changes
- Plan next iteration

## Success Criteria

### Must Have:

- ✅ All entities use UUIDs
- ✅ Clear index-based ordering (1, 2, 3...)
- ✅ Basic document attachment works
- ✅ Existing functionality still works
- ✅ Agents can onboard with document context

### Nice to Have (Next Iteration):

- Parallelization analysis
- Advanced dependency modeling
- Tool refactoring
- Performance optimizations

## Risk Mitigation

- **Keep existing tools working** - Don't break current functionality
- **Incremental changes** - Small, testable updates
- **Backward compatibility** - Existing data should still work
- **Simple rollback** - Changes should be easily reversible

This focused plan gets us 80% of the benefits with 20% of the complexity. We can always add the advanced features later once the core is solid.
