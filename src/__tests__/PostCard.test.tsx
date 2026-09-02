/** PostCard — feed card rendering + interaction affordances. */
import { render, screen, fireEvent } from "@testing-library/react";
import { PostCard, type FeedPost } from "@/components/feed";

const base: FeedPost = {
  id: "p1",
  author: "Maya",
  initial: "M",
  type: "walk-request",
  timeAgo: "2 h",
  distance: "700 m",
  body: "Looking for a weekday morning walk buddy.",
  reactions: 8,
  reacted: false,
  comments: 3,
  live: true,
};

describe("PostCard", () => {
  it("renders author, body, distance and the type tag", () => {
    render(<PostCard post={base} />);
    expect(screen.getByText("Maya")).toBeInTheDocument();
    expect(screen.getByText(/morning walk buddy/)).toBeInTheDocument();
    expect(screen.getByText("700 m")).toBeInTheDocument();
    expect(screen.getByText("Walk mate")).toBeInTheDocument();
    expect(screen.getByText("3 comments")).toBeInTheDocument();
  });

  it("marks a lost post with the alert border and its action button", () => {
    const { container } = render(
      <PostCard post={{ ...base, type: "lost", body: "Beagle slipped his collar." }} />
    );
    expect(container.querySelector("article")).toHaveClass("card-lost");
    expect(screen.getByRole("button", { name: "I saw them" })).toBeInTheDocument();
  });

  it("reflects my reaction state and fires onReact", () => {
    const onReact = jest.fn();
    render(<PostCard post={{ ...base, reacted: true, reactions: 9 }} onReact={onReact} />);
    const paw = screen.getByRole("button", { name: /🐾 9/ });
    expect(paw).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(paw);
    expect(onReact).toHaveBeenCalledTimes(1);
  });

  it("shows the top comment when present", () => {
    render(
      <PostCard
        post={{
          ...base,
          topComment: { author: "Sarah", initial: "S", body: "Want to join?", timeAgo: "1 h" },
        }}
      />
    );
    expect(screen.getByText("Sarah")).toBeInTheDocument();
    expect(screen.getByText(/Want to join\?/)).toBeInTheDocument();
  });

  it("opens the inline reply box from the action button and submits", async () => {
    const onComment = jest.fn().mockResolvedValue(undefined);
    render(<PostCard post={{ ...base, type: "question" }} onComment={onComment} />);
    fireEvent.click(screen.getByRole("button", { name: "Answer" }));
    const input = screen.getByPlaceholderText("Write a reply…");
    fireEvent.change(input, { target: { value: "Try the clinic on 5th." } });
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    expect(onComment).toHaveBeenCalledWith(expect.objectContaining({ id: "p1" }), "Try the clinic on 5th.");
  });
});
