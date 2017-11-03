// import expect from 'expect';
// import deepFreeze from 'deepfreeze';
import {createStore, combineReducers} from 'redux';
import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import {Provider, connect} from 'react-redux';

// start: action creators
// Action creators are exactly that—functions that create actions.
let nextTodoId = 0;
const addTodo = (text) => {
    return {
        type: 'ADD_TODO',
        id: nextTodoId++,
        text
    };
};

const setVisibilityFilter = (filter) => {
    return {
        type: 'SET_VISIBILITY_FILTER',
        filter
    };
};

const toggleTodo = (id) => {
    return {
        type: 'TOGGLE_TODO',
        id
    }
};
// end: action creators

// start: combineReducers
// reducer 是一个 pure function，定义如何根据 actions 去改变 state
// 根据之前的 state 和一个 action，返回下一个 state
// combineReducer 将几个 reducer 返回的 state 放入一个 object 并返回
const todo = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false
            };
        case 'TOGGLE_TODO':
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                completed: !state.completed
            };
        default:
            return state;
    }
};
const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                todo(undefined, action)
            ];
        case 'TOGGLE_TODO':
            return state.map(t => todo(t, action));
        default:
            return state;
    }
};
const visibilityFilter = (state = 'SHOW_ALL',
                          action) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;
        default:
            return state;
    }
};
const todoApp = combineReducers({
    todos,
    visibilityFilter
});
// end: combineReducers

// start: react-redux connect()
// connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])
// [mapStateToProps(state, [ownProps]): stateProps]
// [mapDispatchToProps(dispatch, [ownProps]): dispatchProps]
// 将 React Component 链接到 Redux store
// 当 Redux store 发生改变时，React Component 也会重新 render
const Link = ({
                  active,
                  children,
                  onClick
              }) => {
    if (active) {
        return <span>{children}</span>
    }

    return (
        <a href="#" onClick={e => {
            e.preventDefault();
            onClick(active);
        }}>
            {children}
        </a>
    );
};
// ownProps 是 FilterLink 的 props
const mapStateToLinkProps = (state, ownProps) => {
    return {
        active: ownProps.filter === state.visibilityFilter
    }
};
const mapDispatchToLinkProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch( setVisibilityFilter( ownProps.filter ) );
        }
    };
};
const FilterLink = connect(
    mapStateToLinkProps,
    mapDispatchToLinkProps
)(Link);
// end: react-redux connect()

const Footer = () => (
    <p>
        Show:
        {' '}
        <FilterLink
            filter={'SHOW_ALL'}
        >All</FilterLink>
        {' '}
        <FilterLink
            filter={'SHOW_ACTIVE'}
        >Active</FilterLink>
        {' '}
        <FilterLink
            filter={'SHOW_COMPLETED'}
        >Completed</FilterLink>
    </p>
);

const Todo = ({onClick, completed, text}) => {
    return (
        <li
            onClick={onClick}
            style={{
                textDecoration: completed ?
                    'line-through' : 'none'
            }}
        >
            {text}
        </li>
    );
};

const TodoList = ({todos, onTodoClick}) => {
    // console.log( todos );
    return (
        <ul>
            {todos.map(todo =>
                <Todo
                    key={todo.id}
                    {...todo}
                    onClick={() => onTodoClick(todo.id)}
                />
            )}
        </ul>
    );
};

// start: react-redux connect()
let AddTodo = ({ dispatch }) => {
    let input;

    return (
        <div>
            <input ref={node => {
                input = node;
            }}/>
            <button onClick={() => {
                dispatch( addTodo(input.value) );
                input.value = '';
            }}>
                Add Todo
            </button>
        </div>
    )
};
// 若 connect() 未输入任何值，则默认是返回 dispatch
AddTodo = connect()(AddTodo);
// end: react-redux connect()

const getVisibleTodos = (todos, filter) => {
    switch (filter) {
        case 'SHOW_ALL':
            return todos;
        case 'SHOW_COMPLETED':
            return todos.filter(t => t.completed);
        case 'SHOW_ACTIVE':
            return todos.filter(t => !t.completed);
    }
};

const mapStateToTodoListProps = (state) => {
    return {
        todos: getVisibleTodos(state.todos, state.visibilityFilter)
    };
};
const mapDispatchToTodoListProps = (dispatch) => {
    return {
        onTodoClick: (id) => {
            dispatch( toggleTodo( id ) );
        }
    };
};
const VisibleTodoList = connect(
    mapStateToTodoListProps,
    mapDispatchToTodoListProps
)(TodoList);

const TodoApp = () => (
    <div>
        <AddTodo/>
        <VisibleTodoList/>
        <Footer/>
    </div>
);

// 这里仅需 render 一次即可
// 当状态发生改变时，各 component 内部自己重新 render
// 需要重新 render 的模块需要使用 connect 与 Redux store 链接
ReactDom.render(
    <Provider store={createStore(todoApp)}>
        <TodoApp/>
    </Provider>,
    document.getElementById('root')
);
